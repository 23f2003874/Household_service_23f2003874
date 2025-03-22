export default {
    template: `
    
    <div>
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow">
        <div class="container-fluid">
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto align-items-center">
                    <li class="nav-item">
                        <router-link to="/professional/dashboard" class="btn btn-primary btn-sm shadow fw-bold px-3 py-2">
                            🏠 Home
                        </router-link>
                    </li>
                    <li class="nav-item ms-2">
                        <router-link to="/profSummary" class="btn btn-primary btn-sm shadow fw-bold px-3 py-2">
                            📊 Summary
                        </router-link>
                    </li>
                </ul>

                <!-- Centered Search Bar -->
                <form class="d-flex mx-auto w-50">
                    <input 
                        v-model="searchQuery"
                        class="form-control me-2"
                        type="search"
                        placeholder="🔍 Search services..."
                        aria-label="Search"
                    />
                </form>

                <!-- Profile & Logout -->
                <ul class="navbar-nav ms-auto align-items-center">
                    <li class="nav-item">
                        <span class="badge bg-success fs-6 px-3 py-2">👤 {{ userData.username }}</span>
                    </li>
                    <li class="nav-item ms-3">
                    <button class="btn btn-danger btn-sm px-3 py-2 shadow fw-bold" @click="logout">
                        🚪 Logout
                    </button>
                </li>
                </ul>
            </div>
        </div>
    </nav>


        
        <!-- New Service Requests -->
        
        <div id="dashboard">
    <h4>Today's Services</h4>
    <table v-if="filteredTodayServices.length" class="table table-striped">
        <thead>
            <tr>
                <th>ID</th>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Location</th>
                <th>Pin Code</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
        <tr v-for="service in filteredTodayServices" :key="service.service_id">
                <td>{{ service.service_id }}</td>
                <td>{{ service.customer_name }}</td>
                <td>{{ service.phone_number }}</td>
                <td>{{ service.address }}</td>
                <td>{{ service.pincode }}</td>
                <td>
                    <button class="btn btn-success btn-sm" @click="acceptService(service.service_id)">Accept</button>
                    <button class="btn btn-danger btn-sm" @click="rejectService(service.service_id)">Reject</button>
                </td>
            </tr>
        </tbody>
    </table>
    <p v-else>No service requests for today.</p>

    <h4 class="mt-4">Service History</h4>
    <table v-if="filteredServiceHistory.length" class="table table-striped">
        <thead>
            <tr>
                <th>ID</th>
                <th>Customer Name</th>
                <th>Location</th>
                <th>Phone Number</th>
                <th>Pin Code</th>
                <th>Completion Date</th>
                <th>Remarks</th>
                <th>Rating</th>
            </tr>
        </thead>
        <tbody>
        <tr v-for="service in filteredServiceHistory" :key="service.service_id">
                <td>{{ service.service_id }}</td>
                <td>{{ service.customer_name }}</td>
                <td>{{ service.address }}</td>
                <td>{{ service.phone_number }}</td>
                <td>{{ service.pincode }}</td>
                <td>{{ service.date_of_completion || "Not completed" }}</td>
                <td>{{ service.remarks || "No remarks" }}</td>
                <td>{{ service.rating || "Not rated" }}</td>
            </tr>
        </tbody>
    </table>
    <p v-else>No past service history available.</p>
</div>

        
    
    </div>


    `,


    data() {
        return {
            userData: {},
            todayServices: [],
            serviceRequests: [],
            // newServiceRequests: [],
            serviceHistory: [],  // ✅ This stores all service history records
            todayDate: new Date().toISOString().split("T")[0]  ,
            searchQuery: ""
        };
    },
    computed: {
        filteredTodayServices() {
            if (!this.searchQuery) return this.todayServices || [];

            const query = this.searchQuery.toLowerCase();
            return (this.todayServices || []).filter(service =>
                (service.status || "").toLowerCase().includes(query) ||
                (service.customer_name || "").toLowerCase().includes(query) ||
                (service.pincode || "").includes(query) ||
                (service.date_of_request || "").includes(query)
            );
        },
        filteredServiceHistory() {
            if (!this.searchQuery) return this.serviceHistory || [];

            const query = this.searchQuery.toLowerCase();
            return (this.serviceHistory || []).filter(service =>
                (service.status || "").toLowerCase().includes(query) ||
                (service.customer_name || "").toLowerCase().includes(query) ||
                (service.pincode || "").includes(query) ||
                (service.date_of_request || "").includes(query) ||
                (service.date_of_completion || "").includes(query)
            );
        }
    },
    
    methods: {
        async fetchDashboardData() {
            try {
                const response = await fetch("/api/professional/dashboard", {
                    headers: {
                        "Authentication-Token": localStorage.getItem("auth_token"),
                    },
                });
        
                if (response.redirected) {
                    console.error("Redirected to login, token might be invalid.");
                    window.location.href = "/login"; // Redirect to login page
                    return;
                }
        
                const data = await response.json();
        
                if (data.error) {
                    console.error("Error:", data.error);
                    return;
                }
        
                console.log("🟢 Fetched Dashboard Data:", data); // Debugging log
        
                // ✅ Store user data
                this.userData = {
                    professional_id: data.professional_id,
                    username: data.username,
                    email: data.email,
                    phone_number: data.phone_number,
                    address: data.address,
                    pin_code: data.pin_code,
                    status: data.status,
                    rating: data.rating
                };
        
                // ✅ Separate "Today's Services" (Only Requested)
                this.todayServices = data.today_services.filter(service => service.status === "requested");
        
                // ✅ Move Approved, In-Progress, Closed, Rejected to Service History
                this.serviceHistory = data.closed_services.concat(
                    data.today_services.filter(service => service.status !== "requested")
                );
        
            } catch (error) {
                console.error("Error fetching professional dashboard data:", error);
            }
        }
,        

async acceptService(serviceId) {
    try {
        const response = await fetch(`/api/professional/accept/${serviceId}`, {
            method: "POST",
            headers: {
                "Authentication-Token": localStorage.getItem("auth_token"),
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            console.log("✅ Service accepted successfully");
            this.fetchDashboardData(); // Refresh dashboard data
        } else {
            console.error("❌ Error accepting service:", await response.json());
        }
    } catch (error) {
        console.error("Error accepting service:", error);
    }
},

async rejectService(serviceId) {
    try {
        const response = await fetch(`/api/professional/reject/${serviceId}`, {
            method: "POST",
            headers: {
                "Authentication-Token": localStorage.getItem("auth_token"),
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            console.log("✅ Service rejected successfully");
            this.fetchDashboardData(); // Refresh dashboard data
        } else {
            console.error("❌ Error rejecting service:", await response.json());
        }
    } catch (error) {
        console.error("Error rejecting service:", error);
    }
},

        async fetchProfessionalServiceHistory() {
            try {
                const authToken = localStorage.getItem("auth_token");
        
                if (!authToken) {
                    console.error("❌ No auth token found. Redirecting to login...");
                    window.location.href = "/login";
                    return;
                }
        
                console.log("🔍 Fetching service history for professional...");
                
                const res = await fetch("/api/professional/service-history", {
                    headers: { 
                        "Authentication-Token": authToken,
                        "Content-Type": "application/json"
                    }
                });
        
                if (res.redirected || res.status === 401) {
                    console.error("❌ Unauthorized! Redirecting to login...");
                    window.location.href = "/login";
                    return;
                }
        
                if (!res.ok) throw new Error("Failed to fetch professional service history");
        
                const data = await res.json();
                console.log("🟢 Service History Data:", data);
        
                this.serviceHistory = data;
            } catch (error) {
                console.error("❌ Error fetching professional service history:", error);
            }
        }
,        
async fetchProfessionalServiceRequests() {
    try {
        const response = await fetch("/api/professional/service-requests", {
            headers: {
                "Authentication-Token": localStorage.getItem("auth_token"),
            },
        });

        if (response.redirected) {
            console.error("Redirected to login, token might be invalid.");
            window.location.href = "/login";
            return;
        }

        const data = await response.json();
        console.log("🟢 Fetched Service Requests:", data.newServiceRequests);

        this.serviceRequests = data.newServiceRequests;
    } catch (error) {
        console.error("Error fetching professional service requests:", error);
    }
},
    logout() {
        localStorage.removeItem("auth_token");  // Clear authentication token
        window.location.href = "/";  // Redirect to login page

    },
        goSummary() {
            // Navigate to summary page
        }
    },
    async mounted() {
        await this.fetchDashboardData();
        this.fetchProfessionalServiceRequests();
        this.fetchProfessionalServiceHistory();
    },

}