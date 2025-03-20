// export default {
//     template: `
//     <div>
//         <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
//             <div class="container-fluid">
//                 <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
//                     <span class="navbar-toggler-icon"></span>
//                 </button>
//                 <div class="collapse navbar-collapse" id="navbarNav">
//                     <ul class="navbar-nav">
//                         <router-link to="/professional/dashboard" class="btn btn-primary btn-lg shadow fw-bold">
//                             Home
//                         </router-link>
//                     </ul>
//                 </div>
//             </div>
//         </nav>

//         <div id="summarySection" class="container mt-4">
//             <h2 class="text-center">Professional Summary</h2>
//             <div class="row text-center">
//                 <div class="col-md-3">
//                     <div class="card shadow-lg p-3">
//                         <h4>Customers</h4>
//                         <p class="fw-bold fs-4">{{ customers }}</p>
//                     </div>
//                 </div>
//                 <div class="col-md-3">
//                     <div class="card shadow-lg p-3">
//                         <h4>Service Requests</h4>
//                         <p class="fw-bold fs-4">{{ service_requests }}</p>
//                     </div>
//                 </div>
//             </div>

//             <canvas id="serviceRequestsChart" class="mt-4"></canvas>
//         </div>
//     </div>
//     `,

//     data() {
//         return {
//             services: 0,
//             customers: 0,
//             professionals: 0,
//             service_requests: 0,
//             request_status: {
//                 requested: 0,
//                 closed: 0,
//                 approved: 0,
//                 rejected: 0
//             },
//             chartInstance: null  // To store the chart instance
//         };
//     },

//     mounted() {
//         this.loadSummary();
//     },

//     methods: {
//         loadSummary() {
//             fetch("/api/admin/summary")
//                 .then(response => response.json())
//                 .then(data => {
//                     this.services = data.services;
//                     this.customers = data.customers;
//                     this.professionals = data.professionals;
//                     this.service_requests = data.service_requests;
//                     this.request_status = data.request_status;

//                     this.$nextTick(() => this.renderChart()); // Ensure DOM updates before rendering chart
//                 })
//                 .catch(error => console.error("Error fetching summary:", error));
//         },

//         renderChart() {
//             const ctx = document.getElementById("serviceRequestsChart").getContext("2d");

//             // Destroy existing chart instance if it exists
//             if (this.chartInstance) {
//                 this.chartInstance.destroy();
//             }

//             // Create new chart
//             this.chartInstance = new Chart(ctx, {
//                 type: "bar",
//                 data: {
//                     labels: ["Requested", "Closed", "Approved", "Rejected"],
//                     datasets: [{
//                         label: "Service Requests",
//                         data: [
//                             this.request_status.requested,
//                             this.request_status.closed,
//                             this.request_status.approved,
//                             this.request_status.rejected
//                         ],
//                         backgroundColor: ["#36A2EB", "#4BC0C0", "#FFCE56", "#FF6384"]
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     scales: {
//                         y: { beginAtZero: true }
//                     }
//                 }
//             });
//         }
//     }
// };
// export default {
//     template: `
//     <div>
//         <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
//             <div class="container-fluid">
//                 <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
//                     <span class="navbar-toggler-icon"></span>
//                 </button>
//                 <div class="collapse navbar-collapse" id="navbarNav">
//                     <ul class="navbar-nav">
//                         <router-link to="/professional/dashboard" class="btn btn-primary btn-lg shadow fw-bold">
//                             Home
//                         </router-link>
//                     </ul>
//                 </div>
//             </div>
//         </nav>

//         <div id="summarySection" class="container mt-4">
//             <h2 class="text-center">Professional Summary</h2>
//             <div class="row text-center">
//                 <div class="col-md-4">
//                     <div class="card shadow-lg p-3">
//                         <h4>Customers</h4>
//                         <p class="fw-bold fs-4">{{ customers }}</p>
//                     </div>
//                 </div>
//                 <div class="col-md-4">
//                     <div class="card shadow-lg p-3">
//                         <h4>Service Requests</h4>
//                         <p class="fw-bold fs-4">{{ total_service_requests }}</p>
//                     </div>
//                 </div>
//                 <div class="col-md-4">
//                     <div class="card shadow-lg p-3">
//                         <h4>Service Name</h4>
//                         <p class="fw-bold fs-4">{{ service_name || 'N/A' }}</p>
//                     </div>
//                 </div>
//             </div>

//             <canvas id="serviceRequestsChart" class="mt-4"></canvas>
//         </div>
//     </div>
//     `,

//     data() {
//         return {
//             customers: 0,
//             total_service_requests: 0,
//             service_name: "",
//             request_status: {
//                 requested: 0,
//                 closed: 0,
//                 approved: 0,
//                 rejected: 0
//             },
//             chartInstance: null // To store the chart instance
//         };
//     },

//     mounted() {
//         this.loadProfessionalSummary();
//     },

//     methods: {
//         loadProfessionalSummary() {
//             const professionalId = 1; // Change this to dynamic value if needed

//             fetch(`/api/professional/${professionalId}/summary`)
//                 .then(response => response.json())
//                 .then(data => {
//                     this.customers = data.customer_count;
//                     this.total_service_requests = data.total_service_requests;
//                     this.service_name = data.service_name;
//                     this.request_status = data.request_status;

//                     this.$nextTick(() => this.renderChart()); // Ensure DOM updates before rendering chart
//                 })
//                 .catch(error => console.error("Error fetching professional summary:", error));
//         },

//         renderChart() {
//             const ctx = document.getElementById("serviceRequestsChart").getContext("2d");

//             // Destroy existing chart instance if it exists
//             if (this.chartInstance) {
//                 this.chartInstance.destroy();
//             }

//             // Create new bar chart
//             this.chartInstance = new Chart(ctx, {
//                 type: "bar",
//                 data: {
//                     labels: ["Requested", "Closed", "Approved", "Rejected"],
//                     datasets: [{
//                         label: "Service Requests",
//                         data: [
//                             this.request_status.requested,
//                             this.request_status.closed,
//                             this.request_status.approved,
//                             this.request_status.rejected
//                         ],
//                         backgroundColor: ["#36A2EB", "#4BC0C0", "#FFCE56", "#FF6384"]
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     scales: {
//                         y: { beginAtZero: true }
//                     }
//                 }
//             });
//         }
//     }
// };
export default {
    template: `
    <div>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <router-link to="/professional/dashboard" class="btn btn-primary btn-lg shadow fw-bold">
                            Home
                        </router-link>
                    </ul>
                </div>
            </div>
        </nav>

        <div id="summarySection" class="container mt-4">
            <h2 class="text-center">Professional Summary</h2>
            <div class="row text-center">
                <div class="col-md-4">
                    <div class="card shadow-lg p-3">
                        <h4>Customers</h4>
                        <p class="fw-bold fs-4">{{ customers }}</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card shadow-lg p-3">
                        <h4>Service Requests</h4>
                        <p class="fw-bold fs-4">{{ total_service_requests }}</p>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card shadow-lg p-3">
                        <h4>Service Name</h4>
                        <p class="fw-bold fs-4">{{ service_name || 'N/A' }}</p>
                    </div>
                </div>
            </div>

            <canvas id="serviceRequestsChart" class="mt-4"></canvas>
        </div>
    </div>
    `,

    data() {
        return {
            professional_id: null, 
            customers: 0,
            total_service_requests: 0,
            service_name: "",
            request_status: {
                requested: 0,
                closed: 0,
                approved: 0,
                rejected: 0
            },
            chartInstance: null
        };
    },

    mounted() {
        this.getLoggedInProfessional();
    },
    
    methods: {
        getLoggedInProfessional() {
            fetch('/api/auth/user')  // Replace this with your actual auth endpoint
                .then(response => response.json())
                .then(data => {
                    this.professional_id = data.professional_id; // Set the correct professional ID dynamically
                    this.loadProfessionalSummary();  // Call summary API after setting ID
                })
                .catch(error => console.error("Error fetching logged-in professional:", error));
        },
    
        loadProfessionalSummary() {
            fetch(`/api/professional/${this.professional_id}/summary`)
                .then(response => response.json())
                .then(data => {
                    this.customers = data.customer_count;
                    this.total_service_requests = data.total_service_requests;
                    this.service_name = data.service_name;
                    this.request_status = data.request_status;

                    this.$nextTick(() => this.renderChart());
                })
                .catch(error => console.error("Error fetching professional summary:", error));
        },

        renderChart() {
            const ctx = document.getElementById("serviceRequestsChart").getContext("2d");

            if (this.chartInstance) {
                this.chartInstance.destroy();
            }

            this.chartInstance = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: ["Requested", "Closed", "Approved", "Rejected"],
                    datasets: [{
                        label: "Service Requests",
                        data: [
                            this.request_status.requested,
                            this.request_status.closed,
                            this.request_status.approved,
                            this.request_status.rejected
                        ],
                        backgroundColor: ["#36A2EB", "#4BC0C0", "#FFCE56", "#FF6384"]
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
    }
};
