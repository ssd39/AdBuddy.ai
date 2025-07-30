import sys
import os
import asyncio
from typing import Dict, Any, List

# Add the parent directory to the path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.qloo import qloo_service


async def test_get_similar_companies_from_metadata():
    """
    Test the get_similar_companies_from_metadata function with restaurant business information
    """
    # Hardcoded restaurant business information
    restaurant_metadata: Dict[str, str] = {
        "company_name": "Bistro Delights",
        "company_details": """
        Bistro Delights is an upscale modern Mediterranean restaurant located in downtown San Francisco.
        Founded in 2018, we specialize in fusion Mediterranean cuisine with a California twist.
        
        Our restaurant features:
        - Farm-to-table organic ingredients
        - Sustainable seafood options
        - Hand-crafted cocktails with house-made infusions
        - Vegetarian and vegan-friendly options
        - Private dining rooms for events
        
        Our target audience includes urban professionals (30-55), foodies, special occasion diners,
        and tourists looking for authentic yet innovative Mediterranean cuisine.
        
        We currently have 45 employees and operate one flagship location with plans to expand to
        a second location next year. Our competitors include Kokkari Estiatorio, Acquerello, and
        La Mediterranee.
        
        Known for our award-winning wine selection and innovative take on traditional dishes,
        we've been featured in SF Chronicle's Top 100 Restaurants and earned a Michelin Bib Gourmand
        recognition in 2022.
        """
    }
    
    try:
        # Call the function with our restaurant metadata
        results = await qloo_service.get_similar_companies_from_metadata(restaurant_metadata)
        
        # Print the results
        print(f"Found {len(results)} similar companies:")
        return results
    except Exception as e:
        print(f"Error testing get_similar_companies_from_metadata: {e}")
        return []


if __name__ == "__main__":
    # Run the test function
    results = asyncio.run(test_get_similar_companies_from_metadata())
    
    # Print summary
    print(f"\nTest completed. Resuls: \n\n{results}.")
