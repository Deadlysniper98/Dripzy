import Link from 'next/link';

export const Footer = () => {
    return (
        <div className="af-footer-wrapper">
            <div className="af-footer-card">
                <div className="af-footer-grid">
                    <div className="af-brand-col">
                        <h3>Dripzy.in</h3>
                        <p>Premium tech accessories and electronics for the modern lifestyle.</p>
                    </div>
                    <div className="af-footer-col">
                        <h4>Support</h4>
                        <ul className="af-footer-links">
                            <li><Link href="/warranty">Warranty Policy</Link></li>
                            <li><Link href="/shipping">Shipping Policy</Link></li>
                            <li><Link href="/track-order">Track Your Order</Link></li>
                        </ul>
                    </div>
                    <div className="af-footer-col">
                        <h4>Legal</h4>
                        <ul className="af-footer-links">
                            <li><Link href="/privacy">Privacy Policy</Link></li>
                            <li><Link href="/terms">Terms & Conditions</Link></li>
                        </ul>
                    </div>
                    <div className="af-footer-col">
                        <h4>Company</h4>
                        <ul className="af-footer-links">
                            <li><Link href="/about">About Us</Link></li>
                            <li><Link href="/careers">Join Us</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="af-legal-bar">
                    <div>&copy; {new Date().getFullYear()} Dripzy.in. All rights reserved.</div>
                    <div>INSTAGRAM | X (TWITTER) @dripzy.in</div>
                </div>
            </div>
        </div>
    );
};
