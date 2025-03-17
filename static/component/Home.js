export default {
    template: `
    <div class="vh-100 d-flex align-items-center justify-content-center text-center position-relative" 
         style="background: url('https://source.unsplash.com/1920x1080/?home-services,cleaning,repair') no-repeat center center / cover;">
        <div class="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div> 
        
        <div class="container position-relative text-white">
            <h1 class="display-3 fw-bold text-shadow">Welcome to Household Services</h1>
            <p class="lead">Find professional and reliable household services at your fingertips.</p>
            <router-link to="/login" class="btn btn-primary btn-lg shadow">Login</router-link>
            <router-link to="/register" class="btn btn-outline-light btn-lg shadow ms-3">Register</router-link>
        </div>
        <div class="position-absolute bottom-0 end-0 m-4">
                <router-link to="/profesregister" class="btn btn-warning btn-lg shadow fw-bold">
                    Register as Professional
                </router-link>
            </div>
    </div>`,
    mounted() {
        document.title = "Household Services - Home";
    }
}

