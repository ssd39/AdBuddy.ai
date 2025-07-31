import { OpenaiService } from "./api";

// Define WebRTC session types
export interface WebRTCSessionOptions {
  systemPrompt?: string;
  voice?: string;
  initialGreeting?: string;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onUserTranscript?: (text: string, isFinal: boolean) => void;
  onConnecting?: () => void;
  onConnected?: () => void;
  onSessionReady?: () => void;
  onError?: (error: Error) => void;
  onDisconnect?: () => void;
}

export interface WebRTCSession {
  connect: () => Promise<void>;
  disconnect: () => void;
  mute: () => void;
  unmute: () => void;
  sendText: (text: string) => void;
  sendFile?: (file: File) => void;
}

/**
 * Creates a WebRTC session with the OpenAI Realtime API
 * @param options Configuration options for the session
 * @returns WebRTCSession object with methods to control the session
 */
export function createWebRTCSession(
  options: WebRTCSessionOptions
): WebRTCSession {
  // WebRTC state
  let peerConnection: RTCPeerConnection | null = null;
  let dataChannel: RTCDataChannel | null = null;
  let mediaStream: MediaStream | null = null;
  let audioElement: HTMLAudioElement | null = null;

  // Track if connected or not
  let isConnected = false;
  let isConnecting = false;
  let isMuted = false;

  /**
   * Connect to the OpenAI Realtime API
   */
  const connect = async (): Promise<void> => {
    try {
      if (isConnecting || isConnected) {
        return;
      }

      isConnecting = true;
      options.onConnecting?.();

      // Create audio element for remote audio
      audioElement = document.createElement("audio");
      audioElement.autoplay = true;

      // Create RTCPeerConnection
      peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // Set up handler for remote audio
      peerConnection.ontrack = (event) => {
        if (audioElement) {
          audioElement.srcObject = event.streams[0];
        }
      };

      // Set up data channel for text communication
      dataChannel = peerConnection.createDataChannel("oai-events");

      // Handle incoming messages from the AI
      dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebRTC event received:", data.type);

          // Handle session creation event
          if (data.type === "session.created") {
            // Send system instructions after session is created
            if (options.systemPrompt) {
              if (dataChannel && dataChannel.readyState === "open") {
                console.log("Sending system instructions via session.update");
                dataChannel.send(
                  JSON.stringify({
                    type: "session.update",
                    session: {
                      modalities: ["text", "audio"],
                      instructions: options.systemPrompt,
                      input_audio_transcription: {
                        model: "whisper-1",
                      },
                    },
                  })
                );
                // Once session is updated with system instructions, send an initial greeting if provided
                if (options.initialGreeting) {
                  setTimeout(() => {
                    if (dataChannel && dataChannel.readyState === "open") {
                      // Create a response request without any input to have the model start the conversation
                      dataChannel.send(
                        JSON.stringify({
                          type: "response.create",
                          response: {
                            input: [],
                            instructions: options.initialGreeting,
                          },
                        })
                      );
                    }
                  }, 500);
                }
              }
            }
          }

          // Handle session updated event
          if (data.type === "session.updated") {
            console.log("Session updated successfully");
            // Trigger onSessionReady callback after system instructions are set
            options.onSessionReady?.();
          }

          // Handle AI transcript events for text
          if (data.type === "response.text.delta") {
            if (data.delta?.text) {
              options.onTranscript?.(data.delta.text, false);
            }
          }

          // Handle final AI transcript events for text
          if (data.type === "response.text.done") {
            if (data.text) {
              options.onTranscript?.(data.text, true);
            }
          }

          // Handle AI audio transcript events (what the AI is saying)
          if (data.type === "response.audio_transcript.delta") {
            if (data.delta) {
              options.onTranscript?.(data.delta, false);
            }
          }

          // Handle final AI audio transcript events
          if (data.type === "response.audio_transcript.done") {
            if (data.transcript) {
              options.onTranscript?.(data.transcript, true);
            }
          }

          // Handle user speech transcription deltas (real-time transcription)
          if (
            data.type === "conversation.item.input_audio_transcription.delta"
          ) {
            if (data.delta) {
              options.onUserTranscript?.(data.delta, false);
            }
          }

          // Handle completed user speech transcription
          if (
            data.type ===
            "conversation.item.input_audio_transcription.completed"
          ) {
            if (data.transcript) {
              options.onUserTranscript?.(data.transcript, true);
            }
          }
        } catch (error) {
          console.error("Error parsing data channel message:", error);
        }
      };

      // Get user's microphone stream
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Add audio track to peer connection
      mediaStream.getAudioTracks().forEach((track) => {
        if (peerConnection) {
          peerConnection.addTrack(track, mediaStream!);
        }
      });

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Get session token from our backend
      const sessionResponse =
        await OpenaiService.createRealtimeSessionApiV1OpenaiRealtimeSessionsPost(
          {
            requestBody: {
              voice: options.voice || "alloy",
            },
          }
        );

      // Wait for ICE gathering to complete
      await new Promise<void>((resolve) => {
        const checkState = () => {
          if (!peerConnection) {
            resolve();
            return;
          }
          if (peerConnection.iceGatheringState === "complete") {
            resolve();
          }
        };

        checkState();
        if (peerConnection) {
          peerConnection.onicegatheringstatechange = checkState;
        }
      });

      // Connect to OpenAI's realtime API
      const response = await fetch("https://api.openai.com/v1/realtime", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionResponse.client_secret?.value}`,
          "Content-Type": "application/sdp",
        },
        body: peerConnection.localDescription?.sdp,
      });

      if (!response.ok) {
        throw new Error(`Failed to connect to OpenAI: ${response.statusText}`);
      }

      // Get the SDP answer
      const sdpAnswer = await response.text();

      // Apply remote description
      await peerConnection.setRemoteDescription({
        type: "answer",
        sdp: sdpAnswer,
      });

      // Set up connection state change handler
      peerConnection.oniceconnectionstatechange = () => {
        if (!peerConnection) return;

        console.log("ICE connection state:", peerConnection.iceConnectionState);

        if (peerConnection.iceConnectionState === "connected") {
          isConnected = true;
          isConnecting = false;
          options.onConnected?.();
        } else if (
          peerConnection.iceConnectionState === "disconnected" ||
          peerConnection.iceConnectionState === "failed" ||
          peerConnection.iceConnectionState === "closed"
        ) {
          disconnect();
          options.onDisconnect?.();
        }
      };
    } catch (error) {
      console.error("Error setting up WebRTC:", error);
      isConnecting = false;
      isConnected = false;
      disconnect();
      options.onError?.(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  /**
   * Disconnect from the WebRTC session
   */
  const disconnect = (): void => {
    // Stop all tracks in the media stream
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }

    // Close data channel
    if (dataChannel) {
      dataChannel.close();
      dataChannel = null;
    }

    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }

    // Clean up audio element
    if (audioElement) {
      audioElement.srcObject = null;
      audioElement.remove();
      audioElement = null;
    }

    isConnected = false;
    isConnecting = false;
  };

  /**
   * Mute the microphone
   */
  const mute = (): void => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
      isMuted = true;
    }
  };

  /**
   * Unmute the microphone
   */
  const unmute = (): void => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
      isMuted = false;
    }
  };

  /**
   * Send text message through the data channel
   */
  const sendText = (text: string): void => {
    if (dataChannel && dataChannel.readyState === "open") {
      try {
        // Create a conversation item with user input text
        dataChannel.send(
          JSON.stringify({
            type: "conversation.item.create",
            item: {
              type: "message",
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: text,
                },
              ],
            },
          })
        );

        // Create a response from the model
        dataChannel.send(
          JSON.stringify({
            type: "response.create",
          })
        );
      } catch (error) {
        console.error("Error sending message:", error);
      }
    } else {
      console.warn("Data channel not ready for sending text");
    }
  };

  return {
    connect,
    disconnect,
    mute,
    unmute,
    sendText,
  };
}
