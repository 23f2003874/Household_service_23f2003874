import Home from './component/Home.js'
import Login from './component/Login.js'
import Register from './component/Register.js'
import profesRegister from './component/profesRegister.js'
import AdminDashboard from './component/AdminDashboard.js'
import CustomerDashboard from './component/customer.js'
import ProfessionalDashboard from './component/professional.js'
import Summary from './component/summary.js'
import profSummary from './component/profSummary.js'

const routes = [
    {path: '/',component: Home},
    {path: '/login',component: Login},
    {path: '/register',component:Register},
    {path: '/profesregister',component:profesRegister},
    { path: '/admin', component: AdminDashboard } ,
    {path: '/customer/dashboard',component: CustomerDashboard},
    {path: '/professional/dashboard',component: ProfessionalDashboard},
    {path: '/summary',component: Summary},
    {path: '/profSummary',component: profSummary}
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
})