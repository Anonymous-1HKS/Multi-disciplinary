import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button.jsx';
import './Navbar.css';

function Navbar() {
    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true);

    const handleClick = () => setClick(!click);
    const closeMobileMenu = () => setClick(false);

    const showButton = () => {
        if (window.innerWidth <= 960) {
            setButton(false);
        } else {
            setButton(true);
        }
    };

    useEffect(() => {
        showButton();
        window.addEventListener('resize', showButton);
        return () => window.removeEventListener('resize', showButton);
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                    UNNING <i className="fab fa-typo3" />
                </Link>
                <div className="menu-icon" onClick={handleClick}>
                    <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
                </div>
                <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                    <li className="nav-item">
                        <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                            Home
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/Courses" className="nav-links" onClick={closeMobileMenu}>
                            Courses
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/account" className="nav-links" onClick={closeMobileMenu}>
                            Account
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/About-us" className="nav-links" onClick={closeMobileMenu}>
                            About us
                        </Link>
                    </li>
                </ul>
                {button && <Button buttonStyle="btn--outline">SIGN UP</Button>}
            </div>
        </nav>
    );
}

export default Navbar;