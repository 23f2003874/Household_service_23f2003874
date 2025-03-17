import Home from './component/Home.js'
import Login from './component/Login.js'
import Register from './component/Register.js'
import profesRegister from './component/profesRegister.js'
import Navbar from './component/Navbar.js'
import Footer from './component/Footer.js'
import AdminDashboard from './component/AdminDashboard.js'
import CustomerDashboard from './component/customer.js'
import ProfessionalDashboard from './component/professional.js'

const routes = [
    {path: '/',component: Home},
    {path: '/login',component: Login},
    {path: '/register',component:Register},
    {path: '/profesregister',component:profesRegister},
    { path: '/admin', component: AdminDashboard } ,
    {path: '/customer/dashboard',component: CustomerDashboard},
    {path: '/professional/dashboard',component: ProfessionalDashboard}

]

const router = new VueRouter ({
    routes
})


const app = new Vue ({
    el: "#app",
    router,
    template: `
    <div class="container">

        <router-view></router-view>

    </div>

    `,
    data: {
        section : "frontend"
    },
    // components : {
    //     "nav-bar": Navbar,
    //     "foot": Footer
    // }
})