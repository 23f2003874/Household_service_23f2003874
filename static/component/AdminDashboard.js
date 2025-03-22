export default {
  template: `
  <div>
      <!-- Navigation Bar -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow">
    <div class="container-fluid">
        <!-- Brand & Toggler Button -->
        <router-link to="/admin" class="navbar-brand fw-bold text-light">
            🏠 Admin Panel
        </router-link>

        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>

        <!-- Navbar Content -->
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto align-items-center">
                <li class="nav-item">
                    <router-link to="/admin" class="btn btn-primary btn-lg shadow fw-bold mx-2">
                        Home
                    </router-link>
                </li>
                <li class="nav-item">
                    <router-link to="/summary" class="btn btn-primary btn-lg shadow fw-bold mx-2">
                        Summary
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

            <!-- Profile, Export & Logout Buttons -->
            <ul class="navbar-nav ms-auto align-items-center">
                <li class="nav-item">
                    <span class="badge bg-success fs-6 px-3 py-2">
                        👤 {{ adminData.username || 'Admin' }}
                    </span>
                </li>
                <li class="nav-item ms-3">
                    <button @click="create_csv" class="btn btn-info btn-lg shadow fw-bold">
                        📥 Export CSV
                    </button>
                </li>
                <li class="nav-item ms-3">
                    <button @click="logout" class="btn btn-warning btn-lg shadow fw-bold">
                        🚪 Logout
                    </button>
                </li>
            </ul>
        </div>
    </div>
</nav>


      <div class="container mt-4">
      
    <!-- Create Service Button -->
                <button class="btn btn-primary mb-3" @click="showServiceForm = true">
                    + Create New Service
                </button>

    <!-- Create Service Form (Modal) -->
            <div v-if="showServiceForm" class="modal fade show d-block" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Create New Service</h5>
                            <button type="button" class="btn-close" @click="showServiceForm = false"></button>
                        </div>
                        <div class="modal-body">
                            <input v-model="newService.name" class="form-control mb-2" placeholder="Service Name">
                            <input v-model="newService.base_price" class="form-control mb-2" placeholder="Base Price">
                            <input v-model="newService.time_required" class="form-control mb-2" placeholder="Time Required (mins)">
                            <textarea v-model="newService.description" class="form-control mb-2" placeholder="Description"></textarea>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" @click="showServiceForm = false">Cancel</button>
                            <button class="btn btn-success" @click="createService">Create</button>
                        </div>
                    </div>
                </div>
            </div>
                <div class="container mt-4">
                <div v-if="filteredServices.length">
                    <div class="row">
                         <h3 class="text-center">Available Services</h3>
                                 <div v-for="service in filteredServices" :key="service.id" class="col-md-4">
                            <div class="card mb-3" style="width: auto;">
                                <div class="card-body">
                                    <h5 class="card-title">{{ service.id }}</h5>
                                    <h5 class="card-title">{{ service.name }}</h5>
                                    <h6 class="card-subtitle mb-2 text-muted">Price: {{ service.base_price }}</h6>
                                    <h5 class="card-title">Time: {{ service.time_required }} mins</h5>
                                    <p class="card-text">{{ service.description }}</p>

                                    <div v-if="service.professionals && service.professionals.length">
                                        <table class="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Email</th>
                                                    <th>Experience</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="professional in service.professionals" :key="professional.id">
                                                    <td>{{ professional.id }}</td>
                                                    <td>{{ professional.email }}</td>
                                                    <td>{{ professional.experience }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <p v-else>No professionals available.</p>

                                    <button class="btn btn-primary" @click="editService(service)">Edit</button>
                                    <button class="btn btn-danger" @click="deleteService(service.id)">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p v-if="!this.searchQuery && services.length === 0">No services available!</p>
<p v-if="this.searchQuery && filteredServices.length === 0">No matching services found!</p>


            


                <!-- Edit Service Form (Modal) -->
                <div v-if="showEditForm" class="modal fade show d-block" tabindex="-1">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Edit Service</h5>
                                <button type="button" class="btn-close" @click="showEditForm = false"></button>
                            </div>
                            <div class="modal-body">
                                <input v-model="editServiceData.name" class="form-control mb-2" placeholder="Service Name">
                                <input v-model="editServiceData.base_price" class="form-control mb-2" placeholder="Base Price">
                                <input v-model="editServiceData.time_required" class="form-control mb-2" placeholder="Time Required (mins)">
                                <textarea v-model="editServiceData.description" class="form-control mb-2" placeholder="Description"></textarea>
                            </div>
                            <div class="modal-footer">
                                <button class="btn btn-secondary" @click="showEditForm = false">Cancel</button>
                                <button class="btn btn-success" @click="updateService">Update</button>
                            </div>
                        </div>
                    </div>
                </div>

            <h3>Service Professionals</h3>
            <div class="container">
                <div class="row">
                <div v-for="professional in filteredProfessionals" :key="professional.id" class="col-md-4 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">{{ professional.username }}</h5>
                                <p class="card-text">Email: {{ professional.email }}</p>
                                <p class="card-text">Experience: {{ professional.experience }} years</p>
                                <p class="card-text">Address: {{ professional.address }}</p>
                                <p class="card-text">Pin Code: {{ professional.pin_code }}</p>
                                <p class="card-text">Rating: {{ professional.rating || 'Not rated' }}</p>
                                <p class="card-text">Status: {{ professional.status }}</p>
                                <select class="form-select mb-2" v-model="professional.status" @change="updateProfessionalStatus(professional)">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blocked">Blocked</option>
                                </select>

                                <button class="btn btn-danger me-2" @click="deleteProfessional(professional.id)">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <p v-if="!this.searchQuery && professionals.length === 0">No professionals available!</p>
            <p v-if="this.searchQuery && filteredProfessionals.length === 0">No matching professionals found!</p>
            

                <h3>Customers</h3>
            <div class="container">
                <div class="row">
                <div v-for="customer in filteredCustomers" :key="customer.id" class="col-md-4 mb-3">
                        <div class="card h-100">
                            <div class="card-body">
                                <h5 class="card-title">{{ customer.username }}</h5>
                                <p class="card-text"><strong>Email:</strong> {{ customer.email }}</p>
                                <p class="card-text"><strong>Address:</strong> {{ customer.address }}</p>
                                <p class="card-text"><strong>Pin Code:</strong> {{ customer.pin_code }}</p>
                                <p class="card-text">Status: {{ customer.status }}</p>
                                <select class="form-select mb-2" v-model="customer.status" @change="updateCustomerStatus(customer)">
    <option value="active">Active</option>
    <option value="blocked">Blocked</option>
</select>
                                    <button class="btn btn-danger" @click="deleteCustomer(customer.id)">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <p v-if="!this.searchQuery && customers.length === 0">No customers available!</p>
            <p v-if="this.searchQuery && filteredCustomers.length === 0">No matching customers found!</p>
            


<h3>Service Requests</h3>
<div class="row">
<div v-for="request in filteredServiceRequests" :key="request.id" class="col-md-4">
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">Service: {{ request.service_name }}</h5>
                <p class="card-text">Customer: {{ request.customer_name }}</p>
                <p class="card-text">Professional: {{ request.professional_name }}</p>
                <p class="card-text">Requested Date: {{ request.date_of_request }}</p>
                <p class="card-text">Completion Date: {{ request.date_of_completion || 'N/A' }}</p>
                <p class="card-text">Status: <strong>{{ request.service_status }}</strong></p>
                <p class="card-text">Remarks: {{ request.remarks || 'No remarks' }}</p>
                <p class="card-text">Rating: {{ request.rating || 'Not rated' }}</p>
            </div>
        </div>
    </div>
</div>
<p v-if="!this.searchQuery && serviceRequests.length === 0">No service requests available!</p>
<p v-if="this.searchQuery && filteredServiceRequests.length === 0">No matching service requests found!</p>
</div>
</div>
</div>

  `,

  data() {
      return {
          adminData: {},
          services: [],
          professionals: [],
          customers: [],
          serviceRequests: [],
          searchQuery: "",
          showServiceForm: false,
          showEditForm: false,
          editServiceData: { id: null, name: '', base_price: '', time_required: '', description: '' },
          newService: { name: '', base_price: '', time_required: '', description: '' }
      };
  },

  mounted() {
      this.loadAdminData();
      this.loadServices();
      this.loadProfessionals();
      this.loadCustomers();
      this.loadServicesRequest()
  },

  watch: {
    showServiceForm(newVal) {
        if (newVal) {
            this.newService = { name: '', base_price: '', time_required: '', description: '' };
        }
    }
},

  methods: {
      loadAdminData() {
          fetch("/api/admin", {
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
                  "Authentication-Token": localStorage.getItem("auth_token")
              }
          })
          .then(response => response.json())
          .then(data => {
              if (data.username) {
                  this.adminData = data;
              } else {
                  console.error("Admin data missing username", data);
                  this.adminData = { username: "Unknown Admin" };
              }
          })
          .catch(error => console.error("Error fetching admin data:", error));
      },

      logout() {
        localStorage.removeItem("auth_token");  // Remove auth token
        window.location.href = "/";  // Redirect to homepage
    },
    async create_csv() {
        // Step 1: Send request to create CSV
        const res = await fetch(location.origin + '/create-csv', {
            method: 'GET', // Ensure this method matches your Flask route
            headers: {
                "Content-Type": "application/json",
                "Authentication-Token": localStorage.getItem("auth_token")
            }
        });
    
        // Step 2: Get task ID from response
        const task_id = (await res.json()).task_id;
    
        // Step 3: Poll for CSV file completion
        const interval = setInterval(async () => {
            const res = await fetch(`${location.origin}/get-csv/${task_id}`, {
                method: 'GET',
                headers: {
                    "Authentication-Token": localStorage.getItem("auth_token") // Include token
                }
            });
    
            if (res.ok) {
                console.log('CSV is ready');
                window.open(`${location.origin}/get-csv/${task_id}`, "_blank"); // Open file in new tab
                clearInterval(interval); // Stop polling
            }
        }, 100); // Poll every 3 seconds instead of 100ms (to avoid excessive requests)
    }
,    
      loadServices() {fetch("http://127.0.0.1:5000/api/services", {
        method: "GET",
        headers: { 
            "Content-Type": "application/json", 
            "Authentication-Token": localStorage.getItem("auth_token") 
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Services:", data);
        this.services = data;
    })
    .catch(error => console.error("Error fetching services:", error));
},
    
    loadProfessionals() {
        fetch("http://127.0.0.1:5000/api/professionals", {
            method: "GET",
            headers: { "Authentication-Token": localStorage.getItem("auth_token") }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Professionals API Response:", data);  // ✅ Check what the API returns
            this.professionals = Array.isArray(data) ? data : [];  // ✅ Ensure it's an array
        })
        .catch(error => console.error("Error loading professionals:", error));
    }
,    
updateProfessionalStatus(professional) {
    fetch(`/api/professionals/${professional.id}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify({ status: professional.status })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Professional status updated", data);
    })
    .catch(error => console.error("Error updating professional status:", error));
},

updateCustomerStatus(customer) {
    fetch(`/api/customers/${customer.id}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify({ status: customer.status })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Customer status updated", data);
    })
    .catch(error => console.error("Error updating customer status:", error));
}
,
    
      loadCustomers() {
          fetch("http://127.0.0.1:5000/api/customers", {
              method: "GET",
              headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth_token") }
          })
          .then(response => response.json())
          .then(data => this.customers = data)
          .catch(error => console.error("Error fetching customers:", error));
      },
      loadServicesRequest() {
        fetch("http://127.0.0.1:5000/api/service-requests", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authentication-Token": localStorage.getItem("auth_token")
            }
        })
        .then(response => response.json())
        .then(data => {
            this.serviceRequests = data;  // ✅ Store data in serviceRequests
        })
        .catch(error => console.error("Error fetching service requests:", error));
    },
    

    //   createService() {
    //       fetch("http://127.0.0.1:5000/api/services", {
    //           method: "POST",
    //           headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth_token") },
    //           body: JSON.stringify(this.newService)
    //       })
    //       .then(response => response.json())
    //       .then(data => {
    //           console.log("Service created:", data);
    //           this.loadServices();
    //           this.showServiceForm = false;
    //       })
    //       .catch(error => console.error("Error creating service:", error));
    //   },
    createService() {
        fetch("http://127.0.0.1:5000/api/services", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authentication-Token": localStorage.getItem("auth_token") 
            },
            body: JSON.stringify(this.newService)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Service created:", data);
            this.loadServices();  // Refresh the services list
            this.showServiceForm = false;  // Close modal
            
            // ✅ Reset the form fields to blank
            this.newService = { name: '', base_price: '', time_required: '', description: '' };
        })
        .catch(error => console.error("Error creating service:", error));
    },
      editService(service) {
        this.editServiceData = { ...service };
        this.showEditForm = true;
    },

    updateService() {
        fetch(`/api/services/${this.editServiceData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth_token") },
            body: JSON.stringify(this.editServiceData)
        })
        .then(response => response.json())
        .then(data => {
            this.loadServices();
            this.showEditForm = false;
        })
        .catch(error => console.error("Error updating service:", error));
    },

    // deleteService(serviceId) {
    //     if (!confirm("Are you sure you want to delete this service?")) return;
        
    //     fetch(`/api/services/${serviceId}`, {
    //         method: "DELETE",
    //         headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth_token") }
    //     })
    //     .then(() => {
    //         this.loadServices();
    //     })
    //     .catch(error => console.error("Error deleting service:", error));
    // },
    deleteService(serviceId) {
        if (!confirm("Are you sure you want to delete this service?")) return;
        
        fetch(`/api/services/${serviceId}`, {
            method: "DELETE",
            headers: { 
                "Content-Type": "application/json", 
                "Authentication-Token": localStorage.getItem("auth_token") 
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message.includes("successfully")) {  // ✅ Ensure successful deletion
                alert("✅ Service deleted successfully!");
    
                // ✅ Remove the deleted service from the UI
                this.services = this.services.filter(service => service.id !== serviceId);
    
                // ✅ Remove related professionals (if stored separately)
                this.professionals = this.professionals.filter(pro => pro.service_id !== serviceId);
    
                // ✅ Remove related service requests (if stored separately)
                this.serviceRequests = this.serviceRequests.filter(req => req.service_id !== serviceId);
            } else {
                alert("❌ Error: " + data.message);
            }
        })
        .catch(error => console.error("Error deleting service:", error));
    }
,    
     // Delete a customer
     deleteCustomer(id) {
        if (confirm("Are you sure you want to delete this customer?")) {
            fetch(`/api/customers/${id}`, {
                method: "DELETE",
                headers: {
                    "Authentication-Token": localStorage.getItem("auth_token")
                }
            })
            .then(response => response.json())
            .then(() => {
                console.log("Customer deleted");
                this.customers = this.customers.filter(customer => customer.id !== id);  // ✅ Remove customer from UI
                this.serviceRequests = this.serviceRequests.filter(req => req.customer_id !== id);  // ✅ Remove related service requests
            })
            .catch(error => console.error("Error deleting customer:", error));
        }
    }
,    
    //  deleteCustomer(id) {
    //             if (confirm("Are you sure you want to delete this customer?")) {
    //                 fetch(`/api/customers/${id}`, {
    //                     method: "DELETE",
    //                     headers: {
    //                         "Authentication-Token": localStorage.getItem("auth_token")
    //                     }
    //                 })
    //                 .then(response => response.json())
    //                 .then(() => {
    //                     console.log("Customer deleted");
    //                     this.loadCustomers();
    //                 })
    //                 .catch(error => console.error("Error deleting customer:", error));
    //             }
    //         },
         // Delete a professional
//     deleteProfessional(id) {
//         if (confirm("Are you sure you want to delete this professional?")) {
//             fetch(`/api/professionals/${id}`, {
//                 method: "DELETE",
//                 headers: {
//                     "Authentication-Token": localStorage.getItem("auth_token")
//                 }
//             })
//             .then(response => response.json())
//             .then(() => {
//                 console.log("Professional deleted");
//                 this.loadProfessionals();
//             })
//             .catch(error => console.error("Error deleting professional:", error));
//         }
//     },
//  },
deleteProfessional(id) {
    if (confirm("Are you sure you want to delete this professional?")) {
        fetch(`/api/professionals/${id}`, {
            method: "DELETE",
            headers: {
                "Authentication-Token": localStorage.getItem("auth_token")
            }
        })
        .then(response => response.json())
        .then(() => {
            console.log("Professional deleted");
            this.professionals = this.professionals.filter(pro => pro.id !== id);  // ✅ Remove professional from UI
            this.serviceRequests = this.serviceRequests.filter(req => req.professional_id !== id);  // ✅ Remove related service requests
        })
        .catch(error => console.error("Error deleting professional:", error));
    }}
}
,
 
 goToSummary() {
    this.$router.push("/api/admin/summary");
  },
computed: {
    filteredServices() {
        if (!this.searchQuery) return this.services || [];

        const query = this.searchQuery.toLowerCase();
        return (this.services || []).filter(service =>
            (service.name || "").toLowerCase().includes(query) ||
            (service.base_price && service.base_price.toString().includes(query)) ||
            (service.time_required && service.time_required.toString().includes(query)) ||
            (service.description || "").toLowerCase().includes(query)
        );
    },

    filteredProfessionals() {
        if (!this.searchQuery) return this.professionals || [];

        const query = this.searchQuery.toLowerCase();
        return (this.professionals || []).filter(professional =>
            (professional.username || "").toLowerCase().includes(query) ||
            (professional.email || "").toLowerCase().includes(query) ||
            (professional.address || "").toLowerCase().includes(query) ||
            (professional.status || "").toLowerCase().includes(query)
        );
    },

    filteredCustomers() {
        if (!this.searchQuery) return this.customers || [];

        const query = this.searchQuery.toLowerCase();
        return (this.customers || []).filter(customer =>
            (customer.username || "").toLowerCase().includes(query) ||
            (customer.email || "").toLowerCase().includes(query) ||
            (customer.address || "").toLowerCase().includes(query) ||
            (customer.status || "").toLowerCase().includes(query)
        );
    },

    filteredServiceRequests() {
        if (!this.searchQuery) return this.serviceRequests || [];

        const query = this.searchQuery.toLowerCase();
        return (this.serviceRequests || []).filter(request =>
            (request.service_name || "").toLowerCase().includes(query) ||
            (request.customer_name || "").toLowerCase().includes(query) ||
            (request.professional_name || "").toLowerCase().includes(query) ||
            (request.service_status || "").toLowerCase().includes(query)
        );
    }


}

}