// export default {
//     template: `
    
//     <div>
//         <!-- Navbar -->
//         <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
//             <div class="container-fluid">
//                 <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
//                     <span class="navbar-toggler-icon"></span>
//                 </button>
//                 <div class="collapse navbar-collapse" id="navbarNav">
//                     <ul class="navbar-nav">
//                         <router-link to="/professional/dashboard" class="btn btn-primary btn-lg shadow fw-bold">Home</router-link>
//                         <li class="nav-item">
//                             <a class="nav-link" href="#" @click.prevent="goSummary">Summary</a>
//                         </li>
//                         <li class="nav-item">
//                             <input 
//                                 v-model="searchQuery"
//                                 class="form-control me-2"
//                                 type="search"
//                                 placeholder="Search services..."
//                                 aria-label="Search"
//                             />
//                         </li>
//                         <li class="nav-item">
//                             <a class="nav-link" href="#" @click.prevent="logout">Logout</a>
//                         </li>
//                     </ul>
//                     <span class="navbar-text ms-auto">Welcome, {{ userData.username }}</span>
//                 </div>
//             </div>
//         </nav>

//         <!-- New Service Requests -->
//         <div class="container mt-4">
//             <h3>Today's Services</h3>
//             <table class="table table-striped">
//                 <thead>
//                     <tr>
//                         <th>ID</th>
//                         <th>Customer name</th>
//                         <th>Phone number</th>
//                         <th>Location</th>
//                         <th>Pin code</th>
//                         <th>Actions</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     <tr v-for="request in newServiceRequests" :key="request.id">
//                         <td>{{ request.id }}</td>
//                         <td>{{ request.customer.username }}</td>
//                         <td>{{ request.customer.phone_number }}</td>
//                         <td>{{ request.customer.address }}</td>
//                         <td>{{request.customer.pin_code}}
//                         <td>
//                             <button v-if="request.status === 'Requested'" class="btn btn-success btn-sm" @click="approveRequest(request.id)">Approve</button>
//                             <button v-if="request.status === 'Requested'" class="btn btn-danger btn-sm" @click="rejectRequest(request.id)">Reject</button>
//                         </td>
//                     </tr>
//                 </tbody>
//             </table>
//         </div>

//         <!-- Service History -->
//         <div class="container mt-4">
//             <h3>Service History</h3>
//             <table class="table table-striped">
//                 <thead>
//                     <tr>
//                         <th>ID</th>
//                         <th>Customer Name</th>
//                         <th>Location</th>
//                         <th>Phone number</th>
//                         <th>Pincode</th>
//                         <th>Completion Date</th>
//                         <th>Review</th>
//                         <th>Rating</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     <tr v-for="history in filteredServiceHistory" :key="history.id">
//                         <td>{{ history.id }}</td>
//                         <td>{{ history.customer.username }}</td>
//                         <td>{{ history.customer.address }}</td>
//                         <td>{{ history.customer.phone_number }}</td>
//                         <td>{{ history.customer.pin_code }}</td>
//                         <td>{{ history.date_of_completion }}</td>
//                         <td>{{ history.remarks }}</td>
//                         <td>{{ history.rating }}</td>
//                     </tr>
//                 </tbody>
//             </table>
//         </div>
//     </div>


//     `,
//     data() {
//         return {
//             userData: {},
//             services: [],
//             serviceHistory: [],
//             newServiceRequests: [], // New property for service requests
//             searchQuery: "",
//             showReviewModal: false,
//             review: {
//                 rating: 5,
//                 remarks: "",
//                 serviceId: null
//             }
//         };
//     },
    
//     // data() {
//     //     return {
//     //         userData: {},
//     //         services: [],
//     //         serviceHistory: [],
//     //         searchQuery: "",
//     //         showReviewModal: false,
//     //         review: {
//     //             rating: 5,
//     //             remarks: "",
//     //             serviceId: null
//     //         }
//     //     };
//     // },
//     computed: {
//         filteredServices() {
//             return this.services.filter(service =>
//                 service.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
//                 service.base_price.toString().includes(this.searchQuery) ||
//                 service.time_required.toString().includes(this.searchQuery)
//             );
//         },
    
//         filteredServiceHistory() {
//             console.log("Applying filters to service history...");
//             let result = this.serviceHistory.filter(history =>
//                 history.customer_username?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
//                 history.status?.toLowerCase().includes(this.searchQuery.toLowerCase())
//             );
//             console.log("Filtered Results:", result);
//             return result;
//         }
//     },
    
//     // computed: {
//     //     filteredServices() {
//     //         return this.services.filter(service =>
//     //             service.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
//     //             service.base_price.toString().includes(this.searchQuery) ||
//     //             service.time_required.toString().includes(this.searchQuery)
//     //         );
//     //     },

//     //     filteredServiceHistory() {
//     //         console.log("Applying filters to service history...");
//     //         let result = this.serviceHistory.filter(history =>
//     //             history.customer_username?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
//     //             history.status?.toLowerCase().includes(this.searchQuery.toLowerCase())
//     //         );
//     //         console.log("Filtered Results:", result);
//     //         return result;
//     //     }
//     // },
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
//                 this.fetchNewServiceRequests(data.user_id);  // Fetch new service requests
//             })
//             .catch(err => console.error("Error fetching user data:", err));
//         },
    
//         fetchNewServiceRequests(professional_id) {
//             if (!professional_id) {
//                 console.error("Error: professional_id is undefined!");
//                 return;
//             }
    
//             console.log("Fetching new service requests for professional_id:", professional_id);
    
//             fetch(`/api/professional/${professional_id}/new_service_requests`, {
//                 headers: { "Authentication-Token": localStorage.getItem("auth_token") }
//             })
//             .then(response => response.json())
//             .then(data => {
//                 console.log("New Service Requests:", data);
//                 this.newServiceRequests = data; // Store the new service requests
//             })
//             .catch(error => console.error("Error fetching new service requests:", error));
//         },
    
//         approveRequest(requestId) {
//             fetch('/api/professional/approve_request', {
//                 method: 'POST',
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authentication-Token": localStorage.getItem("auth_token")
//                 },
//                 body: JSON.stringify({ request_id: requestId })
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     alert("Service request approved!");
//                     this.fetchNewServiceRequests(this.userData.id); // Refresh the new service requests
//                     this.fetchServiceHistory(this.userData.id); // Refresh service history
//                 } else {
//                     alert("Failed to approve service request: " + data.message);
//                 }
//             })
//             .catch(error => console.error("Error approving service request:", error));
//         },
    
//         rejectRequest(requestId) {
//             fetch('/api/professional/reject_request', {
//                 method: 'POST',
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authentication-Token": localStorage.getItem("auth_token")
//                 },
//                 body: JSON.stringify({ request_id: requestId })
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.success) {
//                     alert("Service request rejected!");
//                     this.fetchNewServiceRequests(this.userData.id); // Refresh the new service requests
//                 } else {
//                     alert("Failed to reject service request: " + data.message);
//                 }
//             })
//             .catch(error => console.error("Error rejecting service request:", error));
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
//                     this.fetchServiceHistory(this.userData.id); // Refresh service history
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
    
// //     mounted() {
// //         this.fetchUserData();
// //         this.fetchProfessionalServices();
// //     },

// //     methods: {
// //         fetchUserData() {
// //             fetch('/api/professional/dashboard', {
// //                 headers: { "Authentication-Token": localStorage.getItem("auth_token") }
// //             })
// //             .then(res => res.json())
// //             .then(data => {
// //                 if (!data.user_id) {
// //                     console.error("Error: professional_id is missing from response");
// //                     return;
// //                 }
        
// //                 console.log("Fetched professional_id:", data.user_id);  // Debugging log
// //                 this.userData = { ...this.userData, ...data };
// //                 this.fetchServiceHistory(data.user_id);
// //             })
// //             .catch(err => console.error("Error fetching user data:", err));
// //         },

// //         fetchProfessionalServices() {
// //             fetch('/api/professional/services', {
// //                 headers: { "Authentication-Token": localStorage.getItem("auth_token") }
// //             })
// //             .then(res => res.json())
// //             .then(data => this.services = data);
// //         },

// //         acceptService(serviceId) {
// //             fetch('/api/professional/accept_service', {
// //                 method: 'POST',
// //                 headers: {
// //                     "Content-Type": "application/json",
// //                     "Authentication-Token": localStorage.getItem("auth_token")
// //                 },
// //                 body: JSON.stringify({ service_id: serviceId })
// //             })
// //             .then(response => response.json())
// //             .then(data => {
// //                 if (data.success) {
// //                     alert("Service accepted successfully!");
// //                     this.fetchProfessionalServices(); // Fetch updated services
// //                 } else {
// //                     alert("Failed to accept service: " + data.message);
// //                 }
// //             })
// //             .catch(error => console.error("Error accepting service:", error));
// //         },

// //         completeService(serviceId) {
// //             fetch('/api/professional/complete_service', {
// //                 method: 'POST',
// //                 headers: {
// //                     "Content-Type": "application/json",
// //                     "Authentication-Token": localStorage.getItem("auth_token")
// //                 },
// //                 body: JSON.stringify({ service_id: serviceId })
// //             })
// //             .then(response => response.json())
// //             .then(data => {
// //                 if (data.success) {
// //                     alert("Service marked as complete!");
// //                     this.fetchServiceHistory(this.userData.id); // Fetch updated service history
// //                 } else {
// //                     alert("Failed to mark service as complete: " + data.message);
// //                 }
// //             })
// //             .catch(error => console.error("Error completing service:", error));
// //         },

// //         fetchServiceHistory(professional_id) {
// //             if (!professional_id) {
// //                 console.error("Error: professional_id is undefined!");
// //                 return;
// //             }

// //             console.log("Fetching service history for professional_id:", professional_id);

// //             fetch(`/api/professional/${professional_id}/service_history`, {
// //                 headers: { "Authentication-Token": localStorage.getItem("auth_token") }
// //             })
// //             .then(response => {
// //                 if (!response.ok) throw new Error("Failed to fetch service history");
// //                 return response.json();
// //             })
// //             .then(data => {
// //                 console.log("Updated Service History:", data);
// //                 this.serviceHistory = data;  // ✅ Update UI
// //             })
// //             .catch(error => console.error("Error fetching service history:", error));
// //         },

// //         goSummary() {
// //             alert("Navigating to Summary");
// //         },

// //         logout() {
// //             localStorage.removeItem("auth_token");
// //             window.location.href = "/login";
// //         }
// //     }
// // }
// }

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
                        <router-link to="/profSummary" class="btn btn-primary btn-lg shadow fw-bold">
                  Summary
              </router-link>
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
                        <router-link to="/" class="btn btn-warning btn-lg shadow fw-bold">
                    Logout
                </router-link>
                       
                    </ul>
                    <span class="navbar-text ms-auto">Welcome, {{ userData.username }}</span>

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
    
        
        // filteredServiceHistory() {
        //     return this.serviceHistory.filter(history => 
        //         history.customer.username.toLowerCase().includes(this.searchQuery.toLowerCase())
        //     );
        // }
    
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
}
,

// a

// 
//     }
// },
// updateRequestStatus(requestId, status) {
//     const request = this.serviceRequests.find(req => req.id === requestId);
//     if (request) {
//         request.status = status;
//     }
// },
        // updateRequestStatus(requestId, status) {
        //     const request = this.newServiceRequests.find(req => req.id === requestId);
        //     if (request) {
        //         request.status = status;
        //         this.newServiceRequests = this.newServiceRequests.filter(req => req.id !== requestId);
        //     }
        // },
        // moveToHistory(requestId, remarks, rating) {
        //     const request = this.newServiceRequests.find(req => req.id === requestId);
        //     if (request) {
        //         this.serviceHistory.push({
        //             id: request.id,
        //             customer: request.customer,
        //             date_of_completion: new Date().toISOString().split('T')[0],
        //             remarks: remarks,
        //             rating: rating
        //         });
        //         this.newServiceRequests = this.newServiceRequests.filter(req => req.id !== requestId);
        //     }
        // },
        logout() {
            // Logout logic here
        },
        goSummary() {
            // Navigate to summary page
        }
    },
    async mounted() {
        await this.fetchDashboardData();
        this.fetchProfessionalServiceRequests();
        // this.fetchServices();
        // this.fetchServiceHistory();
        this.fetchProfessionalServiceHistory();
    //     this.approveRequest = this.approveRequest.bind(this);
    // this.rejectRequest = this.rejectRequest.bind(this);
    },

}