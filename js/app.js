document.addEventListener("DOMContentLoaded", () => {

    const tbody = document.getElementById("dispatchTable");

    const searchBox = document.getElementById("searchBox");
    const clusterFilter = document.getElementById("clusterFilter");
    const statusFilter = document.getElementById("statusFilter");
    const clearButton = document.getElementById("clearFilters");

    let allData = [];

    let CLUSTER = "";
    let CX_NAME = "";

    // ==========================================
    // COUNT SO TYPES
    // ==========================================
    function getCounts(records){

        const result = {
            NC: 0,
            AO: 0,
            IPTV: 0,
            NWUP: 0,
            RELOC: 0,
            AS: 0,
            WAR0: 0,
            WAR1: 0,
            WAR2: 0,
            WAR3: 0,
            WAR47: 0
        };

        records.forEach(r => {

            const soType = (r["SO TYPE"] || "").trim();
            const age = (r["E.AGE"] || "").trim();

            switch(soType){

                case "NC":
                    result.NC++;
                    break;

                case "A/O":
                    result.AO++;
                    break;

                case "IPTV":
                    result.IPTV++;
                    break;

                case "NWUP":
                    result.NWUP++;
                    break;

                case "RELOC":
                    result.RELOC++;
                    break;

                case "AS":
                    result.AS++;
                    break;

                case "WAR":

                    if(age === "0 D") result.WAR0++;
                    else if(age === "1 D") result.WAR1++;
                    else if(age === "2 D") result.WAR2++;
                    else if(age === "3 D") result.WAR3++;
                    else if(age === "4-7 D") result.WAR47++;

                    break;
            }

        });

        return result;
    }

    // ==========================================
    // LOAD CSV
    // ==========================================
    Papa.parse("data/dispatch.csv", {

        download: true,
        header: true,
        skipEmptyLines: true,

        complete: function(results){

            allData = results.data.map(row => {

                const cleaned = {};

                Object.keys(row).forEach(key => {
                    cleaned[key.replace(/\uFEFF/g, "").trim()] = row[key];
                });

                return cleaned;
            });

            CLUSTER = "CLUSTER";
            CX_NAME = "CX_NAME";

            console.log("Rows:", allData.length);

            populateClusterFilter();
            buildTable();
        },

        error: function(err){
            console.error(err);
        }

    });

    // ==========================================
    // POPULATE CLUSTER FILTER
    // ==========================================
    function populateClusterFilter(){

        clusterFilter.innerHTML =
            '<option value="ALL">All Clusters</option>';

        const clusters = [...new Set(
            allData.map(r => r[CLUSTER])
        )].filter(Boolean);

        clusters.sort();

        clusters.forEach(cluster => {

            const option = document.createElement("option");

            option.value = cluster;
            option.textContent = cluster;

            clusterFilter.appendChild(option);

        });

    }

    // ==========================================
    // BUILD TABLE
    // ==========================================
    function showValue(value){
        return value === 0 ? "" : value;
    }
    
    function buildTable(){

        tbody.innerHTML = "";

        const keyword = searchBox.value.trim().toLowerCase();
        const selectedCluster = clusterFilter.value;

        const clusters = [...new Set(
            allData.map(r => r[CLUSTER])
        )].filter(Boolean);

        clusters.forEach(cluster => {

            let technicians = allData.filter(r =>
                r[CLUSTER] === cluster
            );

            technicians = [...new Map(
                technicians.map(item => [
                    item[CX_NAME],
                    item
                ])
            ).values()];

            technicians = technicians.filter(person => {

                const searchMatch =
                    keyword === "" ||
                    (person[CX_NAME] || "")
                        .toLowerCase()
                        .includes(keyword);

                const clusterMatch =
                    selectedCluster === "ALL" ||
                    cluster === selectedCluster;

                return searchMatch && clusterMatch;

            });

            if(technicians.length === 0)
                return;

            // ========================
            // CLUSTER HEADER ROW
            // ========================
            const clusterRow = document.createElement("tr");

            clusterRow.className = "cluster-row";

            clusterRow.innerHTML = `
                <td class="first-col">${cluster}</td>
                <td colspan="44">Cluster Totals</td>
            `;

            tbody.appendChild(clusterRow);

            // ========================
            // TECHNICIAN ROWS
            // ========================
            technicians.forEach(person => {

                const techRecords = allData.filter(r =>
                    r[CX_NAME] === person[CX_NAME]
                );

                const dispatched = getCounts(techRecords);

                const row = document.createElement("tr");

                row.innerHTML = `

                    <td class="first-col">
                        ${person[CX_NAME]}
                    </td>

                    <!-- DISPATCHED -->

                    <td>${showValue(dispatched.NC)}</td>
                    <td>${showValue(dispatched.AO)}</td>
                    <td>${showValue(dispatched.IPTV)}</td>
                    <td>${showValue(dispatched.NWUP)}</td>
                    <td>${showValue(dispatched.RELOC)}</td>
                    <td>${showValue(dispatched.AS)}</td>
                    
                    <td>${showValue(dispatched.WAR0)}</td>
                    <td>${showValue(dispatched.WAR1)}</td>
                    <td>${showValue(dispatched.WAR2)}</td>
                    <td>${showValue(dispatched.WAR3)}</td>
                    <td>${showValue(dispatched.WAR47)}</td>

                    <!-- COMPLETED -->
                    <td colspan="11"></td>

                    <!-- HANDLED -->
                    <td colspan="11"></td>

                    <!-- UNHANDLED -->
                    <td colspan="11"></td>

                `;

                tbody.appendChild(row);

            });

        });

    }

    // ==========================================
    // EVENTS
    // ==========================================
    searchBox.addEventListener("keyup", buildTable);

    clusterFilter.addEventListener("change", buildTable);

    statusFilter.addEventListener("change", buildTable);

    clearButton.addEventListener("click", () => {

        searchBox.value = "";
        clusterFilter.value = "ALL";
        statusFilter.value = "ALL";

        buildTable();

    });

});
