export default {
    template: `
    <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div class="card p-4 shadow" style="width: 350px;">
            <h3 class="text-center mb-3">Login</h3>
            
            <form @submit.prevent="loginUser">
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" v-model="formData.email" required>
                </div>
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-control" v-model="formData.password" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Login</button>
            </form>
            
            <!-- "Create Account" Section -->
            <div class="text-center mt-3">
                <small class="text-muted">Don't have an account?</small>
                <br>
                <router-link to="/register" class="btn btn-outline-primary btn-sm mt-2 w-75">
                    Create Account
                </router-link>
            </div>

            <p class="text-danger text-center mt-2">{{ message }}</p>
        </div>
    </div>`,
    data() {
        return {
            formData: { email: "", password: "" },
            message: ""
        };
    },

methods: {
    loginUser() {
        fetch('/api/login', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.formData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("🔹 Login API Response:", data); // Debugging

            if (data["auth-token"]) {
                // Check if status is received correctly
                if (data.role === "customer" || data.role === "professional") {
                    if (!data.status) {
                        console.error("❌ Status missing in API response!");
                        this.message = "An error occurred. Please try again.";
                        return;
                    }

                    if (data.status === "inactive") {
                        this.message = "⏳ Waiting for admin approval.";
                        return;
                    } else if (data.status === "blocked") {
                        this.message = "❌ Your account has been blocked by the admin.";
                        return;
                    }
                }

                // Store authentication details
                localStorage.setItem("auth_token", data["auth-token"]);
                localStorage.setItem("id", data.id);
                localStorage.setItem("username", data.username);
                localStorage.setItem("role", data.role);
                localStorage.setItem("status", data.status);  // Store status for later use

                // Redirect based on role
                let redirectPath = "/";
                if (data.role === "admin") {
                    redirectPath = "/admin";
                } else if (data.role === "professional") {
                    redirectPath = "/professional/dashboard";
                } else if (data.role === "customer") {
                    redirectPath = "/customer/dashboard";
                }

                this.$router.push(redirectPath);
            } else {
                this.message = data.message;
            }
        })
        .catch(() => {
            this.message = "Login failed. Please try again.";
        });
    }
}
}