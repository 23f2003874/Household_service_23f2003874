export default {
  template: `
  <div>
      <!-- Navigation Bar -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
          <div class="container-fluid">
              <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                  <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarNav">
                  <ul class="navbar-nav">
                  <router-link to="/admin" class="btn btn-primary btn-lg shadow fw-bold">
                  Home
              </router-link>
                      <li class="nav-item">
                          <a class="nav-link" href="#">Summary</a>
                      </li>
                      <li class="nav-item">
                      <li class="nav-item">
                      <input 
                          v-model="searchQuery"
                          class="form-control me-2"
                          type="search"
                          placeholder="Search services..."
                          aria-label="Search"
                      />
                  </li>
            </li>
                      <router-link to="/" class="btn btn-warning btn-lg shadow fw-bold">
                    Logout
                </router-link>
                    
                  </ul>
                  
                  <span class="navbar-text">
                      Welcome, {{ adminData.username || 'Admin' }}!
                  </span>
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
                <div v-if="services.length">
                    <div class="row">
                    <h3 class="text-center">Available Services</h3>
                        <div v-for="service in services" :key="service.id" class="col-md-4">
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
                <h3 v-else class="middle">No Services are available!</h3>
            


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
                    <div v-for="professional in professionals" :key="professional.id" class="col-md-4 mb-3">
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
            <p v-if="professionals.length === 0">No professionals available.</p>

                <h3>Customers</h3>
            <div class="container">
                <div class="row">
                    <div v-for="(customer, index) in customers" :key="customer.id" class="col-md-4 mb-3">
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
            <p v-if="customers.length === 0" class="text-center mt-3">No customers available.</p>

<h3>Service Requests</h3>
<div class="row">
    <div v-for="request in serviceRequests" :key="request.id" class="col-md-4">
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
<p v-if="serviceRequests.length === 0">No service requests available.</p>

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
    

      createService() {
          fetch("http://127.0.0.1:5000/api/services", {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth_token") },
              body: JSON.stringify(this.newService)
          })
          .then(response => response.json())
          .then(data => {
              console.log("Service created:", data);
              this.loadServices();
              this.showServiceForm = false;
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

    deleteService(serviceId) {
        if (!confirm("Are you sure you want to delete this service?")) return;
        
        fetch(`/api/services/${serviceId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth_token") }
        })
        .then(() => {
            this.loadServices();
        })
        .catch(error => console.error("Error deleting service:", error));
    },
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
                        this.loadCustomers();
                    })
                    .catch(error => console.error("Error deleting customer:", error));
                }
            },
         // Delete a professional
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
                this.loadProfessionals();
            })
            .catch(error => console.error("Error deleting professional:", error));
        }
    },
    
  }
        
,
  computed: {
    filteredCustomers() {
      return this.customers.filter(customer => customer.username.toLowerCase().includes(this.searchQuery.toLowerCase()));
    },
    filteredProfessionals() {
      return this.professionals.filter(professional => professional.username.toLowerCase().includes(this.searchQuery.toLowerCase()));
    },
    filteredServices() {
      return this.services.filter(service => service.name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    },
    filteredServiceRequests() {
      return this.serviceRequests.filter(request => request.service_name.toLowerCase().includes(this.searchQuery.toLowerCase()));
    }
  }
}

