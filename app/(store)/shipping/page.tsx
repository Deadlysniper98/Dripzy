export default function ShippingPage() {
    return (
        <div className="af-legal-page">
            <div className="af-legal-container">
                <h1>Shipping Policy</h1>
                <p className="af-legal-updated">Last updated: January 2026</p>

                <section>
                    <h2>1. Shipping Zones & Delivery Times</h2>
                    <div className="af-shipping-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Zone</th>
                                    <th>Delivery Time</th>
                                    <th>Shipping Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Metro Cities (Delhi, Mumbai, Bangalore, etc.)</td>
                                    <td>2-4 business days</td>
                                    <td>FREE on orders above ₹499</td>
                                </tr>
                                <tr>
                                    <td>Tier 2 Cities</td>
                                    <td>4-6 business days</td>
                                    <td>FREE on orders above ₹699</td>
                                </tr>
                                <tr>
                                    <td>Rest of India</td>
                                    <td>5-8 business days</td>
                                    <td>FREE on orders above ₹999</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2>2. Free Shipping</h2>
                    <p>Enjoy <strong>FREE SHIPPING</strong> on all prepaid orders across India! No minimum order value required for prepaid orders.</p>
                    <p>For Cash on Delivery (COD) orders, standard shipping charges apply based on your location.</p>
                </section>

                <section>
                    <h2>3. Order Processing</h2>
                    <ul>
                        <li>Orders placed before 2 PM IST are processed the same day</li>
                        <li>Orders placed after 2 PM IST are processed the next business day</li>
                        <li>Orders are not processed on Sundays and public holidays</li>
                    </ul>
                </section>

                <section>
                    <h2>4. Tracking Your Order</h2>
                    <p>Once your order is shipped, you'll receive:</p>
                    <ul>
                        <li>SMS and email notification with tracking details</li>
                        <li>Tracking link to monitor your shipment in real-time</li>
                        <li>Estimated delivery date</li>
                    </ul>
                </section>

                <section>
                    <h2>5. Delivery Partners</h2>
                    <p>We partner with India's leading courier services to ensure safe and timely delivery:</p>
                    <ul>
                        <li>Delhivery</li>
                        <li>BlueDart</li>
                        <li>DTDC</li>
                        <li>India Post (for remote areas)</li>
                    </ul>
                </section>

                <section>
                    <h2>6. International Shipping</h2>
                    <p>Currently, we only ship within India. International shipping coming soon!</p>
                </section>

                <section>
                    <h2>7. Contact Us</h2>
                    <p>For shipping queries, contact us at:</p>
                    <p><strong>Email:</strong> shipping@dripzy.in</p>
                </section>
            </div>
        </div>
    );
}
