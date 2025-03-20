// export default {
//     template: `
//     <div>
//     <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
//     <div class="container-fluid">
//               <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
//                   <span class="navbar-toggler-icon"></span>
//               </button>
//               <div class="collapse navbar-collapse" id="navbarNav">
//                   <ul class="navbar-nav">
//                   <router-link to="/admin" class="btn btn-primary btn-lg shadow fw-bold">
//                   Home
//               </router-link>
//               </div>
//       </nav>

//         <div id="summarySection" class="container mt-4">
//             <h2 class="text-center">Admin Summary</h2>
//             <div class="row text-center">
//                 <div class="col-md-3">
//                     <div class="card shadow-lg p-3">
//                         <h4>Services</h4>
//                         <p class="fw-bold fs-4" id="totalServices">0</p>
//                     </div>
//                 </div>
//                 <div class="col-md-3">
//                     <div class="card shadow-lg p-3">
//                         <h4>Customers</h4>
//                         <p class="fw-bold fs-4" id="totalCustomers">0</p>
//                     </div>
//                 </div>
//                 <div class="col-md-3">
//                     <div class="card shadow-lg p-3">
//                         <h4>Professionals</h4>
//                         <p class="fw-bold fs-4" id="totalProfessionals">0</p>
//                     </div>
//                 </div>
//                 <div class="col-md-3">
//                     <div class="card shadow-lg p-3">
//                         <h4>Service Requests</h4>
//                         <p class="fw-bold fs-4" id="totalServiceRequests">0</p>
//                     </div>
//                 </div>
//             </div>

//             <canvas id="serviceRequestsChart" class="mt-4"></canvas>
//         </div>
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
//             }
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

//                     document.getElementById("totalServices").innerText = this.services;
//                     document.getElementById("totalCustomers").innerText = this.customers;
//                     document.getElementById("totalProfessionals").innerText = this.professionals;
//                     document.getElementById("totalServiceRequests").innerText = this.service_requests;

//                     this.renderChart();
//                 })
//                 .catch(error => console.error("Error fetching summary:", error));
//         },

//         renderChart() {
//             const ctx = document.getElementById("serviceRequestsChart").getContext("2d");
//             new Chart(ctx, {
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
                        <router-link to="/admin" class="btn btn-primary btn-lg shadow fw-bold">
                            Home
                        </router-link>
                    </ul>
                </div>
            </div>
        </nav>

        <div id="summarySection" class="container mt-4">
            <h2 class="text-center">Admin Summary</h2>
            <div class="row text-center">
                <div class="col-md-3">
                    <div class="card shadow-lg p-3">
                        <h4>Services</h4>
                        <p class="fw-bold fs-4">{{ services }}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card shadow-lg p-3">
                        <h4>Customers</h4>
                        <p class="fw-bold fs-4">{{ customers }}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card shadow-lg p-3">
                        <h4>Professionals</h4>
                        <p class="fw-bold fs-4">{{ professionals }}</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card shadow-lg p-3">
                        <h4>Service Requests</h4>
                        <p class="fw-bold fs-4">{{ service_requests }}</p>
                    </div>
                </div>
            </div>

            <canvas id="serviceRequestsChart" class="mt-4"></canvas>
        </div>
    </div>
    `,

    data() {
        return {
            services: 0,
            customers: 0,
            professionals: 0,
            service_requests: 0,
            request_status: {
                requested: 0,
                closed: 0,
                approved: 0,
                rejected: 0
            },
            chartInstance: null  // To store the chart instance
        };
    },

    mounted() {
        this.loadSummary();
    },

    methods: {
        loadSummary() {
            fetch("/api/admin/summary")
                .then(response => response.json())
                .then(data => {
                    this.services = data.services;
                    this.customers = data.customers;
                    this.professionals = data.professionals;
                    this.service_requests = data.service_requests;
                    this.request_status = data.request_status;

                    this.$nextTick(() => this.renderChart()); // Ensure DOM updates before rendering chart
                })
                .catch(error => console.error("Error fetching summary:", error));
        },

        renderChart() {
            const ctx = document.getElementById("serviceRequestsChart").getContext("2d");

            // Destroy existing chart instance if it exists
            if (this.chartInstance) {
                this.chartInstance.destroy();
            }

            // Create new chart
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
