# 🛍️ Slow Sunday Boutique: Print-on-Demand (POD) Production Roadmap

This roadmap details the exact steps to connect your deployed **Slow Sunday Boutique** (`EtsyShop`) storefront and API to an automated Print-on-Demand fulfillment provider (**Printify** or **Printful**), map your designs to physical blank products, and automate order dispatch.

---

## 1. Provider Selection: Printify vs. Printful

| Feature | **Printify (Recommended for Margin)** | **Printful (Recommended for Embroidery)** |
|---|---|---|
| **Best For** | Comfort Colors 1717 tees, mugs, linen totes, high margin | Premium direct embroidery on fleece crewnecks |
| **Fulfillment Network** | Distributed print providers (SwiftPOD, Monster Digital) | In-house facilities (US/EU) |
| **Comfort Colors 1717** | Yes (Multiple suppliers: SwiftPOD, Monster Digital) | Limited / higher base price |
| **API & Webhooks** | REST API v1 (`https://api.printify.com/v1`) | REST API v2 (`https://api.printful.com`) |
| **Sample Ordering** | 20% discount on samples | 20% discount on samples |

> [!TIP]
> **Recommended Hybrid Setup**:
> Use **Printify** (SwiftPOD) for the Comfort Colors 1717 tees, sublimation mugs, and tote bags for the lowest base cost.
> Use **Printful** for the embroidered wildflower crewneck (digitized `.dst` stitch files).

---

## 2. Product Catalog & Blank Mapping

Your live catalog in [`apps/api/src/data/products.ts`](file:///Users/richardcraven/Documents/MelkorFactoryProjects/EtsyShop/apps/api/src/data/products.ts) is already structured around 5 flagship boutique categories:

### 1. Comfort Colors® 1717 Garment-Dyed Tee (`prod-2`)
* **Blank Model**: Comfort Colors 1717 Adult Heavyweight Tee (6.1 oz, 100% ring-spun cotton).
* **Target Colors**: Moss Green, Pepper, Terracotta, Ivory, Bay.
* **Print Technology**: Direct-to-Garment (DTG).
* **Artwork Specs**:
  * Dimensions: `4500 x 5400 px` (at 300 DPI).
  * Format: Transparent `.PNG` (RGB, sRGB profile).
  * Placement: Center chest (12" x 16").
* **Recommended Print Provider (Printify)**: *SwiftPOD* or *Monster Digital*.

### 2. Wildflower Embroidered Cozy Fleece Crewneck (`prod-3`)
* **Blank Model**: Gildan 18000 Unisex Heavy Blend Fleece Crewneck (or Independent Trading Co. PRM3500 for ultra-premium).
* **Target Colors**: Heather Oatmeal, Forest Green, Sand, Bone.
* **Print Technology**: Direct Embroidery (left chest sprig) or High-Density DTG.
* **Artwork Specs**:
  * Dimensions: Vector `.SVG` / `.AI` digitized to `.DST` file.
  * Max size: `4" x 4"` left-chest embroidery (under 10,000 stitches).
* **Recommended Print Provider**: *Printful* (built-in automated embroidery digitizer).

### 3. Handcrafted Botanical Wildflower Ceramic Mug (`prod-1`)
* **Blank Model**: 15 oz Large Ceramic Mug (or 11 oz Campfire Speckled Stoneware).
* **Print Technology**: Full-wrap dye sublimation.
* **Artwork Specs**:
  * Dimensions: `2475 x 1155 px` (at 300 DPI).
  * Format: Transparent `.PNG`.
  * Placement: Wrap-around botanical band.
* **Recommended Print Provider (Printify)**: *District Photo* or *Spoke Custom Products*.

### 4. French Washed Linen Market Tote (`prod-5`)
* **Blank Model**: 100% Cotton Canvas / Linen Market Tote (e.g. Liberty Bags 7005).
* **Print Technology**: DTG or Screenprint transfer.
* **Artwork Specs**: `3600 x 4200 px` (at 300 DPI), centered.

### 5. Amber Glass Botanical Candle (`prod-4`)
* *Note*: Candles are typically drop-shipped via specialized candle POD providers (like *Candle Builders* via Printify) using 8oz / 9oz apothecary amber jars with custom printed kraft labels.

---

## 3. Step-by-Step Connection Instructions

### Step 1: Obtain Provider API Credentials
1. Sign up at [printify.com](https://printify.com) (or [printful.com](https://printful.com)).
2. Go to **Settings &rarr; API &rarr; Generate Access Token**.
3. Copy your API token and note your **Shop ID** (visible in your Printify dashboard URL or `/v1/shops.json`).

### Step 2: Configure Environment Variables
In your deployed backend environment (Render Dashboard &rarr; Environment) and local [`.env`](file:///Users/richardcraven/Documents/MelkorFactoryProjects/EtsyShop/apps/api/.env):

```env
# Print-on-Demand Integration
PRINTIFY_API_TOKEN="your_personal_access_token_here"
PRINTIFY_SHOP_ID="your_shop_id_here"
POD_PROVIDER="printify" # or "printful"
POD_ENVIRONMENT="sandbox" # toggle to "production" when live
```

### Step 3: Implement Order Webhook Receiver
When a customer completes a checkout order in the Slow Sunday Boutique frontend:
1. Storefront fires `POST /api/checkout/orders` to your Render API.
2. The API saves the order and dispatches the payload to Printify's API endpoint:
   `POST https://api.printify.com/v1/shops/{shop_id}/orders.json`

```json
{
  "external_id": "order-10492",
  "label": "Slow Sunday #10492",
  "line_items": [
    {
      "product_id": "printify_product_id_for_comfort_colors",
      "variant_id": 12345,
      "quantity": 1
    }
  ],
  "shipping_method": 1,
  "send_shipping_notification": true,
  "address_to": {
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "555-0199",
    "country": "US",
    "region": "CA",
    "address1": "123 Peaceful Way",
    "city": "Ojai",
    "zip": "93023"
  }
}
```

### Step 4: Tracking & Fulfillment Webhooks
1. In Printify/Printful, register a webhook pointing to your deployed Render API:
   `POST https://<your-render-app>.onrender.com/api/webhooks/pod/fulfillment`
2. Listen for `order:shipment:created`.
3. Extract `tracking_number` and `tracking_url` and update your internal order state.

---

## 4. Where Assets Are Stored in Your Repo
* **Storefront Mockups**: [`apps/web/public/products/`](file:///Users/richardcraven/Documents/MelkorFactoryProjects/EtsyShop/apps/web/public/products/)
  * `botanical_herbarium_tee.jpg`
  * `wildflower_crewneck.jpg`
  * `botanical_ceramic_mug.jpg`
  * `amber_botanical_candle.jpg`
  * `french_linen_tote.jpg`
* **Live Product Inventory Model**: [`apps/api/src/data/products.ts`](file:///Users/richardcraven/Documents/MelkorFactoryProjects/EtsyShop/apps/api/src/data/products.ts)
* **Frontend Product Card & Cart**: [`apps/web/src/`](file:///Users/richardcraven/Documents/MelkorFactoryProjects/EtsyShop/apps/web/src/)
