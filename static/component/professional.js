export default {
    template: `
    
    <div>
        <!-- Navbar -->
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <router-link to="/professional/dashboard" class="btn btn-primary btn-lg shadow fw-bold">Home</router-link>
                        <li class="nav-item">
                            <a class="nav-link" href="#" @click.prevent="goSummary">Summary</a>
                        </li>
                        <li class="nav-item">
                            <input 
                                v-model="searchQuery"
                                class="form-control me-2"
                                type="search"
                                placeholder="Search services..."
                                aria-label="Search"
                            />
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="#" @click.prevent="logout">Logout</a>
                        </li>
                    </ul>
                    <span class="navbar-text ms-auto">Welcome, {{ userData.username }}</span>
                </div>
            </div>
        </nav>

        <!-- New Service Requests -->
        <div class="container mt-4">
            <h3>New Service Requests</h3>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Service Name</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="request in newServiceRequests" :key="request.id">
                        <td>{{ request.id }}</td>
                        <td>{{ request.service_name }}</td>
                        <td>{{ request.customer_username }}</td>
                        <td>{{ request.status }}</td>
                        <td>
                            <button v-if="request.status === 'Requested'" class="btn btn-success btn-sm" @click="approveRequest(request.id)">Approve</button>
                            <button v-if="request.status === 'Requested'" class="btn btn-danger btn-sm" @click="rejectRequest(request.id)">Reject</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Service History -->
        <div class="container mt-4">
            <h3>Service History</h3>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Service Name</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="history in filteredServiceHistory" :key="history.id">
                        <td>{{ history.id }}</td>
                        <td>{{ history.service_name }}</td>
                        <td>{{ history.customer_username }}</td>
                        <td>{{ history.status }}</td>
                        <td>
                            <button v-if="history.status === 'In Progress'" class="btn btn-success btn-sm" @click="completeService(history.id)">Complete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>


    `,
    data() {
        return {
            userData: {},
            services: [],
            serviceHistory: [],
            newServiceRequests: [], // New property for service requests
            searchQuery: "",
            showReviewModal: false,
            review: {
                rating: 5,
                remarks: "",
                serviceId: null
            }
        };
    },
    
    // data() {
    //     return {
    //         userData: {},
    //         services: [],
    //         serviceHistory: [],
    //         searchQuery: "",
    //         showReviewModal: false,
    //         review: {
    //             rating: 5,
    //             remarks: "",
    //             serviceId: null
    //         }
    //     };
    // },
    computed: {
        filteredServices() {
            return this.services.filter(service =>
                service.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                service.base_price.toString().includes(this.searchQuery) ||
                service.time_required.toString().includes(this.searchQuery)
            );
        },
    
        filteredServiceHistory() {
            console.log("Applying filters to service history...");
            let result = this.serviceHistory.filter(history =>
                history.customer_username?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                history.status?.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
            console.log("Filtered Results:", result);
            return result;
        }
    },
    
    // computed: {
    //     filteredServices() {
    //         return this.services.filter(service =>
    //             service.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
    //             service.base_price.toString().includes(this.searchQuery) ||
    //             service.time_required.toString().includes(this.searchQuery)
    //         );
    //     },

    //     filteredServiceHistory() {
    //         console.log("Applying filters to service history...");
    //         let result = this.serviceHistory.filter(history =>
    //             history.customer_username?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
    //             history.status?.toLowerCase().includes(this.searchQuery.toLowerCase())
    //         );
    //         console.log("Filtered Results:", result);
    //         return result;
    //     }
    // },
    methods: {
        fetchUserData() {
            fetch('/api/professional/dashboard', {
                headers: { "Authentication-Token": localStorage.getItem("auth_token") }
            })
            .then(res => res.json())
            .then(data => {
                if (!data.user_id) {
                    console.error("Error: professional_id is missing from response");
                    return;
                }
        
                console.log("Fetched professional_id:", data.user_id);  // Debugging log
                this.userData = { ...this.userData, ...data };
                this.fetchServiceHistory(data.user_id);
                this.fetchNewServiceRequests(data.user_id);  // Fetch new service requests
            })
            .catch(err => console.error("Error fetching user data:", err));
        },
    
        fetchNewServiceRequests(professional_id) {
            if (!professional_id) {
                console.error("Error: professional_id is undefined!");
                return;
            }
    
            console.log("Fetching new service requests for professional_id:", professional_id);
    
            fetch(`/api/professional/${professional_id}/new_service_requests`, {
                headers: { "Authentication-Token": localStorage.getItem("auth_token") }
            })
            .then(response => response.json())
            .then(data => {
                console.log("New Service Requests:", data);
                this.newServiceRequests = data; // Store the new service requests
            })
            .catch(error => console.error("Error fetching new service requests:", error));
        },
    
        approveRequest(requestId) {
            fetch('/api/professional/approve_request', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify({ request_id: requestId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Service request approved!");
                    this.fetchNewServiceRequests(this.userData.id); // Refresh the new service requests
                    this.fetchServiceHistory(this.userData.id); // Refresh service history
                } else {
                    alert("Failed to approve service request: " + data.message);
                }
            })
            .catch(error => console.error("Error approving service request:", error));
        },
    
        rejectRequest(requestId) {
            fetch('/api/professional/reject_request', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify({ request_id: requestId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Service request rejected!");
                    this.fetchNewServiceRequests(this.userData.id); // Refresh the new service requests
                } else {
                    alert("Failed to reject service request: " + data.message);
                }
            })
            .catch(error => console.error("Error rejecting service request:", error));
        },
    
        completeService(serviceId) {
            fetch('/api/professional/complete_service', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify({ service_id: serviceId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Service marked as complete!");
                    this.fetchServiceHistory(this.userData.id); // Refresh service history
                } else {
                    alert("Failed to mark service as complete: " + data.message);
                }
            })
            .catch(error => console.error("Error completing service:", error));
        },
    
        fetchServiceHistory(professional_id) {
            if (!professional_id) {
                console.error("Error: professional_id is undefined!");
                return;
            }
    
            console.log("Fetching service history for professional_id:", professional_id);
    
            fetch(`/api/professional/${professional_id}/service_history`, {
                headers: { "Authentication-Token": localStorage.getItem("auth_token") }
            })
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch service history");
                return response.json();
            })
            .then(data => {
                console.log("Updated Service History:", data);
                this.serviceHistory = data;  // ✅ Update UI
            })
            .catch(error => console.error("Error fetching service history:", error));
        },
    
        goSummary() {
            alert("Navigating to Summary");
        },
    
        logout() {
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
        }
    }
    
//     mounted() {
//         this.fetchUserData();
//         this.fetchProfessionalServices();
//     },

//     methods: {
//         fetchUserData() {
//             fetch('/api/professional/dashboard', {
//                 headers: { "Authentication-Token": localStorage.getItem("auth_token") }
//             })
//             .then(res => res.json())
//             .then(data => {
//                 if (!data.user_id) {
//                     console.error("Error: professional_id is missing from response");
//                     return;
//                 }
        
//                 console.log("Fetched professional_id:", data.user_id);  // Debugging log
//                 this.userData = { ...this.userData, ...data };
//                 this.fetchServiceHistory(data.user_id);
//             })
//             .catch(err => console.error("Error fetching user data:", err));
//         },

//         fetchProfessionalServices() {
//             fetch('/api/professional/services', {
//                 headers: { "Authentication-Token": localStorage.getItem("auth_token") }
//             })
//             .then(res => res.json())
//             .then(data => this.services = data);
//         },

//         acceptService(serviceId) {
//             fetch('/api/professional/accept_service', {
//                 method: 'POST',
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authentication-Token": localStorage.getItem("auth_token")
//                 },
//                 body: JSON.stringify({ service_id: serviceId })
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     alert("Service accepted successfully!");
//                     this.fetchProfessionalServices(); // Fetch updated services
//                 } else {
//                     alert("Failed to accept service: " + data.message);
//                 }
//             })
//             .catch(error => console.error("Error accepting service:", error));
//         },

//         completeService(serviceId) {
//             fetch('/api/professional/complete_service', {
//                 method: 'POST',
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authentication-Token": localStorage.getItem("auth_token")
//                 },
//                 body: JSON.stringify({ service_id: serviceId })
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     alert("Service marked as complete!");
//                     this.fetchServiceHistory(this.userData.id); // Fetch updated service history
//                 } else {
//                     alert("Failed to mark service as complete: " + data.message);
//                 }
//             })
//             .catch(error => console.error("Error completing service:", error));
//         },

//         fetchServiceHistory(professional_id) {
//             if (!professional_id) {
//                 console.error("Error: professional_id is undefined!");
//                 return;
//             }

//             console.log("Fetching service history for professional_id:", professional_id);

//             fetch(`/api/professional/${professional_id}/service_history`, {
//                 headers: { "Authentication-Token": localStorage.getItem("auth_token") }
//             })
//             .then(response => {
//                 if (!response.ok) throw new Error("Failed to fetch service history");
//                 return response.json();
//             })
//             .then(data => {
//                 console.log("Updated Service History:", data);
//                 this.serviceHistory = data;  // ✅ Update UI
//             })
//             .catch(error => console.error("Error fetching service history:", error));
//         },

//         goSummary() {
//             alert("Navigating to Summary");
//         },

//         logout() {
//             localStorage.removeItem("auth_token");
//             window.location.href = "/login";
//         }
//     }
// }
}