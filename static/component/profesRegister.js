export default {
    template: `
    <div class="d-flex justify-content-center align-items-center" style="height: 100vh;">
        <div class="border p-4 rounded shadow-sm" style="width: 350px;">
            <h2 class="text-center mb-3">Professional Registration</h2>
            
            <div class="mb-2">
                <label for="name" class="form-label">Name:</label>
                <input type="text" id="name" class="form-control" v-model.trim="formData.username" required>
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
            
            <div class="mb-2">
                <label for="experience" class="form-label">Experience (in years):</label>
                <input type="number" id="experience" class="form-control" v-model.trim="formData.experience" required>
            </div>

            
            <!-- Service Name Dropdown -->
            <div class="mb-2">
                <label for="service_name" class="form-label">Service Name:</label>
                <select id="service_name" class="form-control" v-model="formData.service_id" required>
                    <option value="" disabled>Select a service</option>
                    <option v-for="service in services" :key="service.name" :value="service.id">
                        {{ service.name }}
                    </option>
                </select>
            </div>

            <div class="text-center mt-3">
                <button class="btn btn-primary w-100" @click="registerProfessional">Register</button>
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
                pin_code: "",
                experience: "",
                service_id: ""
            },
            services: [],
            message: "",
            messageType: ""
        };
    },

    created() {
        this.fetchServices();  // Fetch services when the component is created
    },

    methods: {
        fetchServices() {
            console.log("Fetching professional services...");

            fetch('/api/professional/services', {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
            .then(response => {
                console.log("Response received:", response.status);
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: Unable to fetch services`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Professional services fetched:", data);
                this.services = data;
            })
            .catch(error => {
                console.error("Error fetching services:", error);
            });
        },

        registerProfessional() {
            fetch('/api/register/professional', {
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
}

