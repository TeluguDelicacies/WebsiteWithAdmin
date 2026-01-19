-- Migration to add Shipping & Return Policy field to site_settings
ALTER TABLE "public"."site_settings" 
ADD COLUMN IF NOT EXISTS "shipping_return_policy" text DEFAULT '<h2>Shipping & Return Policy</h2>
<p><strong>Effective Date:</strong> January 1, 2025</p>

<h3>1. Shipping Policy</h3>
<p>We take great care in packaging our authentic South Indian delicacies to ensure they reach you in perfect condition.</p>
<ul>
    <li><strong>Processing Time:</strong> Orders are typically processed and dispatched within 24-48 hours of receipt.</li>
    <li><strong>Shipping Partners:</strong> We use reliable courier partners for all deliveries.</li>
    <li><strong>Delivery Timeline:</strong> Depending on your location, delivery usually takes 3-7 business days within India.</li>
    <li><strong>Shipping Charges:</strong> Shipping fees are calculated at checkout based on the weight of the order and the delivery location.</li>
</ul>

<h3>2. Return & Refund Policy</h3>
<p>Due to the perishable nature of our products (pickles, podis, and sweets), we generally do not accept returns. However, your satisfaction is our priority.</p>
<ul>
    <li><strong>Damaged or Incorrect Items:</strong> If you receive a damaged product or an incorrect item, please contact us within 24 hours of delivery.</li>
    <li><strong>Resolution:</strong> In such cases, we will provide a replacement or a refund, subject to verification of the issue (photos may be required).</li>
    <li><strong>Cancellations:</strong> Orders can be cancelled before they are dispatched. Once an order is shipped, cancellations are no longer possible.</li>
</ul>

<h3>3. Contact Us</h3>
<p>For any shipping or return-related queries, please reach out to our support team at help@telugudelicacies.com or via WhatsApp at +91 96767 12031.</p>';

COMMENT ON COLUMN "public"."site_settings"."shipping_return_policy" IS 'Content for Shipping & Return Policy page';
