import Link from 'next/link';

export const Footer = () => {
    return (
        <div className="af-footer-wrapper">
            <div className="af-footer-card">
                <div className="af-footer-grid">
                    <div className="af-brand-col">
                        <h3>Arctic Fox</h3>
                        <p>Redefining travel and technology carry for the digital era.</p>
                    </div>
                    <div className="af-footer-col">
                        <h4>Support</h4>
                        <ul className="af-footer-links">
                            <li><Link href="#">Warranty Policy</Link></li>
                            <li><Link href="#">Shipping Policy</Link></li>
                            <li><Link href="#">Track Your Order</Link></li>
                        </ul>
                    </div>
                    <div className="af-footer-col">
                        <h4>Legal</h4>
                        <ul className="af-footer-links">
                            <li><Link href="#">Privacy Policy</Link></li>
                            <li><Link href="#">Terms & Conditions</Link></li>
                        </ul>
                    </div>
                    <div className="af-footer-col">
                        <h4>Company</h4>
                        <ul className="af-footer-links">
                            <li><Link href="#">About Us</Link></li>
                            <li><Link href="#">Join Us</Link></li>
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
