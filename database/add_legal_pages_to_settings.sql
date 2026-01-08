-- Add legal page content columns to site_settings table with default content

ALTER TABLE "public"."site_settings"
ADD COLUMN "privacy_policy" text DEFAULT '<h2>Privacy Policy for Telugu Delicacies</h2>
<p><strong>Effective Date:</strong> January 1, 2025</p>
<p>At Telugu Delicacies, we value your trust and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit our website or purchase our authentic South Indian food products.</p>

<h3>1. Information We Collect</h3>
<p>We collect information necessary to process your orders and improve your experience, including:</p>
<ul>
    <li><strong>Personal Information:</strong> Name, phone number, email address, and delivery address.</li>
    <li><strong>Order Information:</strong> Products purchased, date of purchase, and payment status.</li>
    <li><strong>Usage Data:</strong> Information about how you interact with our website.</li>
</ul>

<h3>2. How We Use Your Information</h3>
<p>We use your data for the following purposes:</p>
<ul>
    <li>To process and deliver your orders.</li>
    <li>To communicate with you regarding order updates or inquiries.</li>
    <li>To improve our website functionality and product offerings.</li>
    <li>To comply with legal obligations.</li>
</ul>

<h3>3. Data Sharing</h3>
<p>We do not sell your personal information. We may share your data with trusted third-party service providers solely for the purpose of operating our business, such as:</p>
<ul>
    <li>Delivery partners (to ship your orders).</li>
    <li>Payment gateways (to process secure transactions).</li>
</ul>

<h3>4. Data Security</h3>
<p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>

<h3>5. Contact Us</h3>
<p>If you have any questions about this Privacy Policy, please contact us at help@telugudelicacies.com.</p>',

ADD COLUMN "cookie_policy" text DEFAULT '<h2>Cookie Policy</h2>
<p><strong>Effective Date:</strong> January 1, 2025</p>
<p>Telugu Delicacies uses cookies to enhance your browsing experience and ensure our website functions correctly.</p>

<h3>1. What Are Cookies?</h3>
<p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and analyze site traffic.</p>

<h3>2. Types of Cookies We Use</h3>
<ul>
    <li><strong>Essential Cookies:</strong> Necessary for the website to function (e.g., remembering your cart items).</li>
    <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site so we can improve it.</li>
    <li><strong>Functional Cookies:</strong> Remember your choices, such as language preferences.</li>
</ul>

<h3>3. Managing Cookies</h3>
<p>You can choose to disable cookies through your browser settings. However, please note that some features of our website may not function properly if cookies are disabled.</p>',

ADD COLUMN "terms_conditions" text DEFAULT '<h2>Terms of Use</h2>
<p><strong>Effective Date:</strong> January 1, 2025</p>
<p>Welcome to Telugu Delicacies. By accessing or using our website, you agree to comply with and be bound by the following Terms of Use. Please read them carefully.</p>

<h3>1. Products and Services</h3>
<p>We strive to display our products (pickles, podis, sweets) as accurately as possible. However, actual product packaging and colors may vary slightly. All products are subject to availability.</p>

<h3>2. Pricing</h3>
<p>All prices are listed in Indian Rupees (INR). We reserve the right to change prices at any time without prior notice. The price applicable to your order will be the price at the time of purchase.</p>

<h3>3. Orders and Payments</h3>
<ul>
    <li>By placing an order, you represent that you are providing accurate and complete information.</li>
    <li>We reserve the right to cancel or refuse any order at our discretion.</li>
</ul>

<h3>4. Intellectual Property</h3>
<p>All content on this website, including text, images, logos, and recipes, is the property of Telugu Delicacies and is protected by copyright laws.</p>

<h3>5. Limitation of Liability</h3>
<p>Telugu Delicacies shall not be liable for any indirect, incidental, or consequential damages arising arising from your use of our products or website.</p>

<h3>6. Changes to Terms</h3>
<p>We may update these Terms of Use from time to time. Your continued use of the website constitutes acceptance of the revised terms.</p>';

COMMENT ON COLUMN "public"."site_settings"."privacy_policy" IS 'Content for Privacy Policy page';
COMMENT ON COLUMN "public"."site_settings"."cookie_policy" IS 'Content for Cookie Policy page';
COMMENT ON COLUMN "public"."site_settings"."terms_conditions" IS 'Content for Terms of Use page';
