export default {
    template: `
    <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
        <div class="border p-4 rounded shadow-sm" style="width: 350px;">
            <h2 class="text-center mb-3">Customer Registration</h2>
            
            <div class="mb-2">
                <label for="username" class="form-label">Username:</label>
                <input type="text" id="username" class="form-control" v-model.trim="formData.username" required>
            </div>
            
            <div class="mb-2">
                <label for="email" class="form-label">Email:</label>
                <input type="email" id="email" class="form-control" v-model.trim="formData.email" required>
            </div>
            
            <div class="mb-2">
                <label for="password" class="form-label">Password:</label>
                <input type="password" id="password" class="form-control" v-model="formData.password" required>
            </div>

            <div class="mb-2">
                <label for="phone_number" class="form-label">Phone Number:</label>
                <input type="text" id="phone_number" class="form-control" v-model.trim="formData.phone_number" required>
            </div>

            <div class="mb-2">
                <label for="address" class="form-label">Address:</label>
                <input type="text" id="address" class="form-control" v-model.trim="formData.address" required>
            </div>

            <div class="mb-2">
                <label for="pin_code" class="form-label">Pin Code:</label>
                <input type="text" id="pin_code" class="form-control" v-model.trim="formData.pin_code" required>
            </div>
            
            <div class="text-center mt-3">
                <button class="btn btn-primary w-100" @click="registerCustomer">Register</button>
            </div>

            <p v-if="message" class="text-center mt-3" :class="messageType">{{ message }}</p>
        </div>
    </div>`,

    data() {
        return {
            formData: {
                username: "",
                email: "",
                password: "",
                phone_number: "",
                address: "",
                pin_code: ""
            },
            message: "",
            messageType: ""
        };
    },

    methods: {
        registerCustomer() {
            // Basic validation to prevent empty submissions
            if (!this.formData.username || !this.formData.email || !this.formData.password ||
                !this.formData.phone_number || !this.formData.address || !this.formData.pin_code) {
                this.message = "All fields are required!";
                this.messageType = "text-danger";
                return;
            }

            fetch('/api/register', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this.formData) 
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    this.message = "Registration successful!";
                    this.messageType = "text-success";
                    setTimeout(() => this.$router.push('/login'), 1000);
                } else {
                    this.message = data.error || "Registration failed!";
                    this.messageType = "text-danger";
                }
            })
            .catch(error => {
                console.error("Registration failed:", error);
                this.message = "Error occurred during registration.";
                this.messageType = "text-danger";
            });
        }
    }
};
