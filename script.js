// const Menu = document.getElementById("menu");
// document.getElementById('btn').addEventListener('click', function () {
//     // console.log('clicked');
//     Menu.classList.toggle('dropdown');
// })

const navbar = `
<navbar class="navbar">
            <a href="/" class="logo-container">
                <img class="logo-img" src="/images/Logo.png" />
            </a >

            <div class="nav-user-management">
                <!-- Containers hidden and showed using javascript -->
                <div class="guest" id="nav-guest-container">
                    <a href="login.html" class="nav-login-btn">Login</a>
                    <a href="register.html" class="nav-register-btn"
                        >Register</a
                    >
                </div>

                <div class="authenticated" id="nav-authenticated-container">
                    <!-- If logged in, Image  added in API Calls/Home.js -->
                    <div id="authenticated-user-nav-profile">
                        <img src="/images/user.png" class="profile-img-sm" />
                    </div>

                    <i class="fa fa-chevron-down nav-profile-chevron"></i>
                </div>
            </div>

            <div
                id="nav-dropdown-items"
                class="nav-dropdown-items display-none"
            >
                <a href="/profile.html" class="link-to-profile">Profile</a>
                <span onclick="logout()" id="logout-btn">Log Out</span>
            </div>
        </navbar>
`;

const navbarContainer = document.getElementById("navbar-container");
navbarContainer.innerHTML = navbar;

const footer = `
<div class="footer-container">
                <span>&copy;</span>
                    &nbsp;
                <span class="parafooter">
                    Tuk Projects Repository. All rights Reserved
                </span>
            </div>
`;

const footerElement = document.getElementById("footer");
footerElement.innerHTML = footer;
