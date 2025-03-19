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
                        <router-link to="/customer/dashboard" class="btn btn-primary btn-lg shadow fw-bold">Home</router-link>
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

        <!-- Available Services -->
        <div class="container mt-4">
            <h2>Available Services</h2>
            <div class="row">
                <div v-for="service in filteredServices" :key="service.id" class="col-md-4">
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">{{ service.name }}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Price: {{ service.base_price }}</h6>
                            <p>Time Required: {{ service.time_required }} mins</p>
                            <p>{{ service.description }}</p>
                            <div v-if="service.professionals.length">
                            <select v-model="selectedProfessionals[service.id]" class="form-select">
                                <option value="" disabled selected>Choose a professional</option>
                                <option v-for="pro in service.professionals" :key="pro.id" :value="pro.id">
                                    {{ pro.name }} ({{ pro.experience }} years experience)
                                </option>
                            </select>
            
                            <button class="btn btn-primary btn-sm mt-2" 
                                    @click="bookService(service.id, selectedProfessionals[service.id])"
                                    :disabled="!selectedProfessionals[service.id]">
                                Book Service
                            </button>
                        </div>
            
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container mt-4">
                <h3>Service History</h3>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Service Name</th>
                            <th>customer Name</th>
                            <th>Professional</th>
                            <th>Email</th>
                            <th>Phone No.</th>
                            <th>Date of request</th>
                            <th>Date of completion</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="history in filteredServiceHistory" :key="history.id">
                            <td>{{ history.id }}</td>
                            <td>{{ history.service_name }}</td>
                            <td>{{ history.customer_name }}</td>
                            <td>{{ history.professional_username }}</td>
                            <td>{{ history.professional_email }}</td>
                            <td>{{ history.phone_no }}</td>
                            <td>
                                <span v-if="!history.isEditingDate">{{ history.date_of_request }}</span>
                                <button class="btn btn-warning btn-sm me-2" @click="editService(history)">Edit</button>
                            </td>
                            <td>{{ history.date_of_completion }}</td>
                            <td>{{ history.status }}</td>
                            <td>
                            
                            <button class="btn btn-warning btn-sm" @click="openReviewModal(history)">Close</button>
                            <button class="btn btn-danger btn-sm" @click="deleteServiceRequest(history.id)">Delete</button>

                            <!-- Review & Rating Modal -->
                    <div v-if="showReviewModal" class="modal fade show d-block" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Submit Review and Close Service</h5>
                                <button type="button" class="btn-close" @click="showReviewModal = false"></button>
                            </div>
                            <div class="modal-body">
                                <input v-model="userRating" type="number" min="1" max="5" class="form-control mb-2" placeholder="Rating (1-5)">
                                <textarea v-model="userRemark" class="form-control mb-2" placeholder="Write a remark"></textarea>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-secondary" @click="showReviewModal = false">Cancel</button>
                                <button class="btn btn-success" @click="submitReview">Submit</button>
                            </div>
                        </div>
                    </div>
        </div> 
                </td>
                        </tr>
                    </tbody>
                </table>
           
        
        
            <!-- Edit Modal -->
            <div v-if="showEditForm" class="modal fade show d-block" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit Date of Request</h5>
                            <button type="button" class="btn-close" @click="showEditForm = false"></button>
                        </div>
                        <div class="modal-body">
                            <label class="form-label">Select New Date:</label>
                            <input type="date" v-model="editDateData.date_of_request" class="form-control mb-2">
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" @click="showEditForm = false">Cancel</button>
                            <button class="btn btn-success" @click="updateService">Update</button>
                        </div>
                    </div>
                </div>
            </div>    
        </div>
        </div>
    </div>
    `,

    data() {
        return {
            userData: {},
            selectedProfessionals: {} ,
            services: [],
            // customerId: localStorage.getItem("customer_id"), // Ensure this is set
            serviceHistory: [],
            searchQuery: "",
            showEditForm: false,
            editServiceData: {customer_id: null,
                service_id: null,
                date_of_request: " "  // Store selected date
            },
            showReviewModal: false,  // Controls modal visibility
            userRating: null,        // Stores the rating input
            userRemark: "",          // Stores the remark input
            selectedHistory: null  
        };
    },

    computed: 
        {
            filteredServices() {
                return this.services.filter(service =>
                    service.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    service.base_price.toString().includes(this.searchQuery) ||
                    service.time_required.toString().includes(this.searchQuery)
                );
            }
        ,
         
            filteredServiceHistory() {
                console.log("Applying filters to service history...");
                let result = this.serviceHistory.filter(history =>
                    history.professional_username?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    history.professional_email?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    history.pincode?.toString().includes(this.searchQuery) ||
                    history.address?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    history.status?.toLowerCase().includes(this.searchQuery.toLowerCase())
                );
                console.log("Filtered Results:", result);
                return result;
            }
        },
        

    mounted() {
        this.fetchUserData();
    },
    methods: {
        async fetchUserData() {
            try {
                const res = await fetch('/api/customer/dashboard', {
                    headers: { "Authentication-Token": localStorage.getItem("auth_token") }
                });
                const data = await res.json();
    
                if (!data.customer_id) {  // ✅ Ensure `customer_id` is present
                    console.error("Error: customer_id is missing from response");
                    return;
                }
    
                // ✅ Store both `user_id` and `customer_id`
                this.userData = {
                    user_id: data.user_id,
                    customer_id: data.customer_id,  // ✅ Correct customer_id for API calls
                    username: data.username
                };
    
                console.log("🟢 User Data:", this.userData);  // Debugging Log
    
                await this.fetchServiceHistory(data.customer_id);
                await this.fetchCustomerServices();
            } catch (err) {
                console.error("Error fetching user data:", err);
            }
        },
        async fetchServiceHistory() {
            try {
                const customer_id = this.userData?.customer_id;  // ✅ Use userData to get customer_id
                
                if (!customer_id) {
                    console.error("❌ Error: customer_id is undefined in fetchServiceHistory()");
                    return;
                }
        
                console.log(`🔍 Fetching service history for customer_id: ${customer_id}`);
        
                const res = await fetch(`/api/customer/${customer_id}/service_history`, {
                    headers: { "Authentication-Token": localStorage.getItem("auth_token") }
                });
        
                this.serviceHistory = await res.json();
            } catch (err) {
                console.error("Error fetching service history:", err);
            }
        }
,        
        // async fetchServiceHistory(customer_id) {
        //     try {
        //         if (!customer_id) {
        //             console.error("❌ Error: Missing customer_id in fetchServiceHistory()");
        //             return;
        //         }
    
        //         console.log(`🔍 Fetching service history for customer_id: ${customer_id}`);
    
        //         const res = await fetch(`/api/customer/${customer_id}/service_history`, {
        //             headers: { "Authentication-Token": localStorage.getItem("auth_token") }
        //         });
    
        //         this.serviceHistory = await res.json();
        //     } catch (err) {
        //         console.error("Error fetching service history:", err);
        //     }
        // },
    
        async fetchCustomerServices() {
            try {
                const res = await fetch('/api/customer/services', {
                    headers: { "Authentication-Token": localStorage.getItem("auth_token") }
                });
                this.services = await res.json();
            } catch (err) {
                console.error("Error fetching services:", err);
            }
        },
    
        // bookService(serviceId) {
        //     fetch('/api/customer/book_service', {
        //         method: 'POST',
        //         headers: {
        //             "Content-Type": "application/json",
        //             "Authentication-Token": localStorage.getItem("auth_token")
        //         },
        //         body: JSON.stringify({ service_id: serviceId })
        //     })
        //     .then(response => response.json())
        //     .then(data => {
        //         if (data.success) {
        //             alert("✅ Service booked successfully!");
        //             this.fetchServiceHistory(this.userData.customer_id);  // ✅ Pass correct customer_id
        //         } else {
        //             alert("❌ Failed to book service: " + data.message);
        //         }
        //     })
        //     .catch(error => console.error("Error booking service:", error));
        // },
        // async bookService(serviceId, professionalId) {
        //     if (!professionalId) {
        //         alert("❌ Please select a professional before booking.");
        //         return;
        //     }
    
        //     try {
        //         const response = await fetch('/api/customer/book_service', {
        //             method: 'POST',
        //             headers: {
        //                 "Content-Type": "application/json",
        //                 "Authentication-Token": localStorage.getItem("auth_token")
        //             },
        //             body: JSON.stringify({ service_id: serviceId, professional_id: professionalId })
        //         });
    
        //         const data = await response.json();
    
        //         if (data.success) {
        //             alert("✅ Service booked successfully!");
        //             this.fetchServiceHistory();  // ✅ Refresh service history
        //         } else {
        //             alert("❌ Failed to book service: " + data.message);
        //         }
        //     } catch (error) {
        //         console.error("Error booking service:", error);
        //     }},
        async bookService(serviceId) {
            try {
                const selectedProfessional = this.selectedProfessionals[serviceId];  // ✅ Get selected pro ID
                
                if (!selectedProfessional) {
                    alert("❌ Please select a professional before booking.");
                    return;
                }
        
                const response = await fetch('/api/customer/book_service', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Authentication-Token": localStorage.getItem("auth_token")
                    },
                    body: JSON.stringify({ 
                        service_id: serviceId, 
                        pro_id: selectedProfessional  // ✅ Send selected pro ID 
                    })
                });
        
                const data = await response.json();
        
                if (data.success) {
                    alert("✅ Service booked successfully!");
                    this.fetchServiceHistory(); // ✅ Fetch updated history
                } else {
                    alert("❌ Failed to book service: " + data.message);
                }
            } catch (error) {
                console.error("Error booking service:", error);
            }
        }
,        
        openReviewModal(history) {
            console.log("🔹 Close button clicked for service ID:", history.id);
            this.selectedHistory = history;
            this.userRating = null;   // Reset rating input
            this.userRemark = "";     // Reset remark input
            this.showReviewModal = true;  // Open modal
        },
    
        // submitReview() {
        //     if (!this.userRating || !this.userRemark) {
        //         alert("⚠️ Please provide both a rating and a remark!");
        //         return;
        //     }
    
        //     fetch(`/api/customer/service_history/${this.selectedHistory.id}/review`, {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json",
        //             "Authentication-Token": localStorage.getItem("auth_token")
        //         },
        //         body: JSON.stringify({
        //             rating: this.userRating,
        //             remark: this.userRemark
        //         })
        //     })
        //     .then(response => response.json())
        //     .then(data => {
        //         if (data.message === "Review submitted successfully") {
        //             console.log("✅ Review submitted!");
        //             this.showReviewModal = false;  // Close modal
        //             this.fetchServiceHistory(this.userData.customer_id);    // ✅ Fetch updated history
        //         } else {
        //             console.error("Error: ", data.message);
        //         }
        //     })
        //     .catch(error => console.error("Error submitting review:", error));
        // },
//         submitReview() {
//             if (!this.userRating || !this.userRemark) {
//                 alert("⚠️ Please provide both a rating and a remark!");
//                 return;
//             }
        
//             fetch(`/api/customer/service_history/${this.selectedHistory.id}/review`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authentication-Token": localStorage.getItem("auth_token")
//                 },
//                 body: JSON.stringify({
//                     rating: this.userRating,
//                     remark: this.userRemark
//                 })
//             })
//             .then(response => response.json())
//             .then(data => {
//                 if (data.message === "Review submitted successfully") {
//                     console.log("✅ Review submitted!");
        
//                     // ✅ Directly update the selected entry in `serviceHistory`
//                     const index = this.serviceHistory.findIndex(h => h.id === this.selectedHistory.id);
//                     if (index !== -1) {
//                         this.serviceHistory[index].rating = this.userRating;
//                         this.serviceHistory[index].remark = this.userRemark;
//                     }
        
//                     this.showReviewModal = false;  // Close modal
//                 } else {
//                     console.error("Error: ", data.message);
//                 }
//             })
//             .catch(error => console.error("Error submitting review:", error));
//         }
// ,        
// submitReview() {
//     if (!this.userRating || !this.userRemark) {
//         alert("⚠️ Please provide both a rating and a remark!");
//         return;
//     }

//     fetch(`/api/customer/service_history/${this.selectedHistory.id}/review`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authentication-Token": localStorage.getItem("auth_token")
//         },
//         body: JSON.stringify({
//             rating: this.userRating,
//             remark: this.userRemark
//         })
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log("🔍 Server Response:", data);  // ✅ Debug response

//         if (data.message === "Review submitted successfully") {
//             console.log("✅ Review submitted!");

//             // ✅ Find index of the updated service
//             const index = this.serviceHistory.findIndex(h => h.id === this.selectedHistory.id);
//             if (index !== -1) {
//                 // ✅ Update values (force Vue to detect changes)
//                 this.$set(this.serviceHistory, index, { 
//                     ...this.serviceHistory[index], 
//                     rating: this.userRating, 
//                     remark: this.userRemark, 
//                     status: "closed"
//                 });

//                 console.log("🔄 Updated serviceHistory:", this.serviceHistory);
//             }

//             this.showReviewModal = false;  // Close modal
//         } else {
//             console.error("❌ Error:", data.message);
//         }
//     })
//     .catch(error => console.error("❌ Error submitting review:", error));}
async submitReview() {
    if (!this.userRating || !this.userRemark) {
        alert("⚠️ Please provide both a rating and a remark!");
        return;
    }

    try {
        const res = await fetch(`/api/customer/service_history/${this.selectedHistory.id}/review`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authentication-Token": localStorage.getItem("auth_token")
            },
            body: JSON.stringify({
                rating: this.userRating,
                remark: this.userRemark
            })
        });

        const data = await res.json();
        console.log("🔍 Server Response:", data);

        if (res.ok) {
            console.log("✅ Review submitted successfully!");
            this.showReviewModal = false;
            this.fetchServiceHistory(this.userData.customer_id);  // ✅ Refresh without reload
        } else {
            console.warn("⚠️ Unexpected response:", data.message || "Unknown error");
        }

    } catch (error) {
        console.error("❌ Error submitting review:", error);
    }
}

,
        editService(service) {
            console.log("✏️ Editing service:", service); // Debugging Log
    
            // ✅ Ensure editDateData gets correct values
            this.editDateData = { 
                customer_id: service.customer_id || this.userData.customer_id,  // ✅ Use correct customer_id
                service_id: service.id || null, 
                date_of_request: service.date_of_request || null 
            };
    
            this.showEditForm = true;  // Show the modal
            console.log("🛠️ Modal Opened:", this.showEditForm, "Data:", this.editDateData);  // Debug log
        },
    
        updateService() {
            console.log("📅 Updating Date:", this.editDateData);
    
            if (!this.editDateData.customer_id || !this.editDateData.service_id) {
                console.error("❌ Error: Missing customer_id or service_id!");
                alert("Error: Missing required data. Please try again.");
                return;
            }
    
            fetch(`/api/customer/${this.editDateData.customer_id}/service_history/${this.editDateData.service_id}/date_of_request`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": localStorage.getItem("auth_token")
                },
                body: JSON.stringify({ date_of_request: this.editDateData.date_of_request }) 
            })
            .then(response => response.json())
            .then(data => {
                console.log("Response:", data);
    
                if (data.error) {
                    console.error("❌ Error from API:", data.error);
                    alert("Failed to update. " + data.error);
                } else {
                    this.showEditForm = false;
                    alert("✅ Date updated successfully!");
                    this.fetchServiceHistory(this.editDateData.customer_id);  // ✅ Ensure correct customer_id
                }
            })
            .catch(error => {
                console.error("Error updating date:", error);
                alert("⚠️ An error occurred while updating.");
            });
        },
    
        
            // deleteServiceRequest(history) {
            //     fetch(`/api/customer/${this.customerId}/service_history/${history.id}`, {
            //         method: 'DELETE',
            //         headers: {
            //             "Authentication-Token": localStorage.getItem("auth_token")
            //         }
            //     })
            //     .then(response => response.json())
            //     .then(data => {
            //         if (data.message) {
            //             console.log(data.message);
            //             this.fetchServiceHistory(this.customerId); // Refresh table
            //         } else {
            //             console.error("Error: ", data.error);
            //         }
            //     })
            //     .catch(error => console.error("Error deleting service request:", error));
            // },
            deleteServiceRequest(history) {
                console.log("Deleting service request for:", history);
                console.log("Customer ID:", this.customerId, "Service Request ID:", history.id);
            
                if (!this.customerId || !history.id) {
                    console.error("Error: Missing customerId or service request ID");
                    return;
                }
            
                fetch(`/api/customer/${this.customerId}/service_history/${history.id}`, {
                    method: "DELETE",
                    headers: {
                        "Authentication-Token": localStorage.getItem("auth_token"),
                        "Content-Type": "application/json"
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.message) {
                        console.log("Success:", data.message);
                        this.fetchServiceHistory(this.customerId); // Refresh table
                    } else {
                        console.error("Error: ", data.error);
                    }
                })
                .catch(error => console.error("Error deleting service request:", error));
            }
            
            // deleteServiceRequest(history) {
            //     if (!confirm("Are you sure you want to delete this service request?")) {
            //         return;
            //     }
            
            //     fetch(`/api/customer/${this.customerId}/service_history/${history.id}`, {
            //         method: 'DELETE',
            //         headers: {
            //             "Content-Type": "application/json",
            //             "Authentication-Token": localStorage.getItem("auth_token")
            //         }
            //     })
            //     .then(response => response.json())
            //     .then(data => {
            //         if (data.message) {
            //             console.log(data.message);
            //             this.fetchServiceHistory(this.customerId); // Refresh table
            //         } else {
            //             console.error("Error: ", data.error);
            //         }
            //     })
            //     .catch(error => console.error("Error deleting service request:", error));
            // }
,            

        logout() {
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
        }
    }
};
