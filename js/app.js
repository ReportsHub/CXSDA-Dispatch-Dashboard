document.addEventListener("DOMContentLoaded", () => {

    const tbody = document.getElementById("dispatchTable");

    const searchBox = document.getElementById("searchBox");
    const ageFilter = document.getElementById("ageFilter");
    const lastMileFilter = document.getElementById("lastMileFilter");
    const clusterFilter = document.getElementById("clusterFilter");
    const statusFilter = document.getElementById("statusFilter");
    const detailModal = document.getElementById("detailModal");
    const modalBody = document.getElementById("modalBody");
    const closeModal = document.getElementById("closeModal");
    const clearButton = document.getElementById("clearFilters");

    closeModal.addEventListener(
        "click",
        () => detailModal.style.display = "none"
    );

    let allData = [];

    let CLUSTER = "";
    let CX_NAME = "";

    const clusterOrder = [
        "CLUSTER 1",
        "CLUSTER 2",
        "CLUSTER 3",
        "CLUSTER 4",
        "CLUSTER 5",
        "CLUSTER 6",
        "SME"
    ];

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
            populateAgeFilter();
            populateLastMileFilter();
            
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

        const clusters = clusterOrder.filter(cluster =>
            allData.some(r => r[CLUSTER] === cluster)
        );

        clusters.forEach(cluster => {

            const option = document.createElement("option");

            option.value = cluster;
            option.textContent = cluster;

            clusterFilter.appendChild(option);

        });

    }

    function populateAgeFilter(){

        ageFilter.innerHTML =
            '<option value="ALL">All Aging</option>';
    
        const ages = [...new Set(
            allData.map(r => r["E.AGE"])
        )]
        .filter(Boolean)
        .sort();
    
        ages.forEach(age => {
    
            const option =
                document.createElement("option");
    
            option.value = age;
            option.textContent = age;
    
            ageFilter.appendChild(option);
    
        });
    
    }
    
    function populateLastMileFilter(){
    
        lastMileFilter.innerHTML =
            '<option value="ALL">All Last Mile</option>';
    
        const activities = [...new Set(
            allData.map(r => r["ACTIVITY"])
        )]
        .filter(Boolean)
        .sort();
    
        activities.forEach(activity => {
    
            const option =
                document.createElement("option");
    
            option.value = activity;
            option.textContent = activity;
    
            lastMileFilter.appendChild(option);
    
        });
    
    }

    // ==========================================
    // BUILD TABLE
    // ==========================================
    function showValue(value){
        return value === 0 ? "" : value;
    }

    function createDrillCell(
        value,
        status,
        soType,
        age
    ){
    
        if(value === 0){
            return `<td></td>`;
        }
    
        return `
            <td
                class="drilldown"
                data-status="${status}"
                data-sotype="${soType}"
                data-age="${age || ""}"
            >
                ${value}
            </td>
        `;
    }
    function showDrillDown(title, records, showCXName = false){
        const tableClass =
        showCXName
            ? "cluster-details"
            : "tech-details";
        
        let html = `
            <h3 style="margin-bottom:10px;">
                ${title}
            </h3>
            <p style="margin-bottom:15px;">
                <strong>Total Records:</strong>
                ${records.length}
            </p>
    
            <table class="${tableClass}">
    
                <thead>
                    <tr>
                        <th>WO ID</th>
                    
                        ${showCXName ? "<th>CX Name</th>" : ""}
                    
                        <th>E.Age</th>
                        <th>Activity</th>
                        <th>Last Mile</th>
                        <th>Customer Name</th>
                        <th>Customer Address</th>
                        <th>Account Number</th>
                    </tr>
                </thead>
    
                <tbody>
        `;
    
        records.forEach(r => {
    
            html += `
                <tr>
                    <td>${r["Work Order ID"] || ""}</td>
                    ${showCXName ? `<td>${r["CX_NAME"] || ""}</td>` : ""}
                    <td>${r["E.AGE"] || ""}</td>
                    <td>${r["SO TYPE"] || ""}</td>
                    <td>${r["ACTIVITY"] || ""}</td>
                    <td>${r["Customer Name"] || ""}</td>
                    <td>${r["Address"] || ""}</td>
                    <td>${r["Account Number"] || ""}</td>
                </tr>
            `;
    
        });
    
        html += `
                </tbody>
            </table>
        `;
    
        modalBody.innerHTML = html;
    
        detailModal.style.display = "block";
    }

    function getTotal(data){
    
        return (
            data.NC +
            data.AO +
            data.IPTV +
            data.NWUP +
            data.RELOC +
            data.AS +
            data.WAR0 +
            data.WAR1 +
            data.WAR2 +
            data.WAR3 +
            data.WAR47
        );
    
    }
    
    function buildTable(){

        tbody.innerHTML = "";

        const keyword = searchBox.value.trim().toLowerCase();
        const selectedCluster = clusterFilter.value;
        const selectedAge = ageFilter.value;
        const selectedLastMile = lastMileFilter.value;

        const clusters = clusterOrder.filter(cluster =>
            allData.some(r => r[CLUSTER] === cluster)
        );

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

                let techRecords = allData.filter(r =>
                    r[CX_NAME] === person[CX_NAME]
                );
                
                if(selectedAge !== "ALL"){
                    techRecords = techRecords.filter(r =>
                        (r["E.AGE"] || "").trim() === selectedAge
                    );
                }
                
                if(selectedLastMile !== "ALL"){
                    techRecords = techRecords.filter(r =>
                        (r["ACTIVITY"] || "").trim() === selectedLastMile
                    );
                }
                
                if(techRecords.length === 0){
                    return false;
                }
                
                const dispatched = getCounts(
                    techRecords
                );
                
                const completed = getCounts(
                    techRecords.filter(r =>
                        (r["F.STAT"] || "").trim() === "COMPLETED"
                    )
                );
                
                const handled = getCounts(
                    techRecords.filter(r =>
                        (r["F.STAT"] || "").trim() === "HANDLED"
                    )
                );
                
                const unhandled = getCounts(
                    techRecords.filter(r =>
                        (r["F.STAT"] || "").trim() === "PENDING/UNHANDLED"
                    )
                );
                
                const searchMatch =
                    keyword === "" ||
                    (person[CX_NAME] || "")
                        .toLowerCase()
                        .includes(keyword);
                
                const clusterMatch =
                    selectedCluster === "ALL" ||
                    cluster === selectedCluster;
                
                const selectedStatus = statusFilter.value;
                
                let statusMatch = false;
                
                if(selectedStatus === "DISPATCHED"){
                    statusMatch = getTotal(dispatched) > 0;
                }
                
                else if(selectedStatus === "COMPLETED"){
                    statusMatch = getTotal(completed) > 0;
                }
                
                else if(selectedStatus === "HANDLED"){
                    statusMatch = getTotal(handled) > 0;
                }
                
                else if(selectedStatus === "UNHANDLED"){
                    statusMatch = getTotal(unhandled) > 0;
                }
                
                return searchMatch && clusterMatch && statusMatch;

            });

            if(technicians.length === 0)
                return;

            let clusterRecords = allData.filter(
                r => r[CLUSTER] === cluster
            );
            
            if(selectedAge !== "ALL"){
                clusterRecords = clusterRecords.filter(r =>
                    (r["E.AGE"] || "").trim() === selectedAge
                );
            }
            
            if(selectedLastMile !== "ALL"){
                clusterRecords = clusterRecords.filter(r =>
                    (r["ACTIVITY"] || "").trim() === selectedLastMile
                );
            }
            
            const clusterDispatched = getCounts(clusterRecords);
            
            const clusterCompleted = getCounts(
                clusterRecords.filter(r =>
                    (r["F.STAT"] || "").trim() === "COMPLETED"
                )
            );
            
            const clusterHandled = getCounts(
                clusterRecords.filter(r =>
                    (r["F.STAT"] || "").trim() === "HANDLED"
                )
            );
            
            const clusterUnhandled = getCounts(
                clusterRecords.filter(r =>
                    (r["F.STAT"] || "").trim() === "PENDING/UNHANDLED"
                )
            );

            // ========================
            // CLUSTER HEADER ROW
            // ========================
            const clusterRow = document.createElement("tr");

            clusterRow.className = "cluster-row";

            clusterRow.innerHTML = `

            <td class="first-col">${cluster}</td>
            
            <!-- DISPATCHED -->
            ${createDrillCell(clusterDispatched.NC,"DISPATCHED","NC")}
            ${createDrillCell(clusterDispatched.AO,"DISPATCHED","A/O")}
            ${createDrillCell(clusterDispatched.IPTV,"DISPATCHED","IPTV")}
            ${createDrillCell(clusterDispatched.NWUP,"DISPATCHED","NWUP")}
            ${createDrillCell(clusterDispatched.RELOC,"DISPATCHED","RELOC")}
            ${createDrillCell(clusterDispatched.AS,"DISPATCHED","AS")}
            
            ${createDrillCell(clusterDispatched.WAR0,"DISPATCHED","WAR","0 D")}
            ${createDrillCell(clusterDispatched.WAR1,"DISPATCHED","WAR","1 D")}
            ${createDrillCell(clusterDispatched.WAR2,"DISPATCHED","WAR","2 D")}
            ${createDrillCell(clusterDispatched.WAR3,"DISPATCHED","WAR","3 D")}
            ${createDrillCell(clusterDispatched.WAR47,"DISPATCHED","WAR","4-7 D")}
            
            <!-- COMPLETED -->
            ${createDrillCell(clusterCompleted.NC,"COMPLETED","NC")}
            ${createDrillCell(clusterCompleted.AO,"COMPLETED","A/O")}
            ${createDrillCell(clusterCompleted.IPTV,"COMPLETED","IPTV")}
            ${createDrillCell(clusterCompleted.NWUP,"COMPLETED","NWUP")}
            ${createDrillCell(clusterCompleted.RELOC,"COMPLETED","RELOC")}
            ${createDrillCell(clusterCompleted.AS,"COMPLETED","AS")}
            
            ${createDrillCell(clusterCompleted.WAR0,"COMPLETED","WAR","0 D")}
            ${createDrillCell(clusterCompleted.WAR1,"COMPLETED","WAR","1 D")}
            ${createDrillCell(clusterCompleted.WAR2,"COMPLETED","WAR","2 D")}
            ${createDrillCell(clusterCompleted.WAR3,"COMPLETED","WAR","3 D")}
            ${createDrillCell(clusterCompleted.WAR47,"COMPLETED","WAR","4-7 D")}
            
            <!-- HANDLED -->
            ${createDrillCell(clusterHandled.NC,"HANDLED","NC")}
            ${createDrillCell(clusterHandled.AO,"HANDLED","A/O")}
            ${createDrillCell(clusterHandled.IPTV,"HANDLED","IPTV")}
            ${createDrillCell(clusterHandled.NWUP,"HANDLED","NWUP")}
            ${createDrillCell(clusterHandled.RELOC,"HANDLED","RELOC")}
            ${createDrillCell(clusterHandled.AS,"HANDLED","AS")}
            
            ${createDrillCell(clusterHandled.WAR0,"HANDLED","WAR","0 D")}
            ${createDrillCell(clusterHandled.WAR1,"HANDLED","WAR","1 D")}
            ${createDrillCell(clusterHandled.WAR2,"HANDLED","WAR","2 D")}
            ${createDrillCell(clusterHandled.WAR3,"HANDLED","WAR","3 D")}
            ${createDrillCell(clusterHandled.WAR47,"HANDLED","WAR","4-7 D")}
            
            <!-- UNHANDLED -->
            ${createDrillCell(clusterUnhandled.NC,"PENDING/UNHANDLED","NC")}
            ${createDrillCell(clusterUnhandled.AO,"PENDING/UNHANDLED","A/O")}
            ${createDrillCell(clusterUnhandled.IPTV,"PENDING/UNHANDLED","IPTV")}
            ${createDrillCell(clusterUnhandled.NWUP,"PENDING/UNHANDLED","NWUP")}
            ${createDrillCell(clusterUnhandled.RELOC,"PENDING/UNHANDLED","RELOC")}
            ${createDrillCell(clusterUnhandled.AS,"PENDING/UNHANDLED","AS")}
            
            ${createDrillCell(clusterUnhandled.WAR0,"PENDING/UNHANDLED","WAR","0 D")}
            ${createDrillCell(clusterUnhandled.WAR1,"PENDING/UNHANDLED","WAR","1 D")}
            ${createDrillCell(clusterUnhandled.WAR2,"PENDING/UNHANDLED","WAR","2 D")}
            ${createDrillCell(clusterUnhandled.WAR3,"PENDING/UNHANDLED","WAR","3 D")}
            ${createDrillCell(clusterUnhandled.WAR47,"PENDING/UNHANDLED","WAR","4-7 D")}
            `;

            tbody.appendChild(clusterRow);

            const clusterDrillCells =
                clusterRow.querySelectorAll(".drilldown");
            
            clusterDrillCells.forEach(cell => {
            
                cell.addEventListener("dblclick", () => {
            
                    const status =
                        cell.dataset.status;
            
                    const soType =
                        cell.dataset.sotype;
            
                    const age =
                        cell.dataset.age;
            
                    const records =
                        clusterRecords.filter(r => {
            
                            const statusMatch =
                                status === "DISPATCHED"
                                    ? true
                                    : (r["F.STAT"] || "").trim() === status;
            
                            const soTypeMatch =
                                (r["SO TYPE"] || "").trim() === soType;
            
                            const ageMatch =
                                soType !== "WAR"
                                    ? true
                                    : (r["E.AGE"] || "").trim() === age;
            
                            return (
                                statusMatch &&
                                soTypeMatch &&
                                ageMatch
                            );
            
                        });
            
                    showDrillDown(
                        `${cluster} | ${status} | ${soType}${age ? " | " + age : ""}`,
                        records,
                        true
                    );
            
                });
            
            });

            // ========================
            // TECHNICIAN ROWS
            // ========================
            technicians.forEach(person => {

                let techRecords = allData.filter(r =>
                    r[CX_NAME] === person[CX_NAME]
                );

                if(selectedAge !== "ALL"){
                    techRecords = techRecords.filter(r =>
                        (r["E.AGE"] || "").trim() === selectedAge
                    );
                }
                
                if(selectedLastMile !== "ALL"){
                    techRecords = techRecords.filter(r =>
                        (r["ACTIVITY"] || "").trim() === selectedLastMile
                    );
                }

                if(techRecords.length === 0){
                    return false;
                }
                
                if(selectedAge !== "ALL"){
                    techRecords = techRecords.filter(r =>
                        (r["E.AGE"] || "").trim() === selectedAge
                    );
                }
                
                if(selectedLastMile !== "ALL"){
                    techRecords = techRecords.filter(r =>
                        (r["ACTIVITY"] || "").trim() === selectedLastMile
                    );
                }
                
                // DISPATCHED
                const dispatched = getCounts(
                    techRecords
                );
                
                // COMPLETED
                const completed = getCounts(
                    techRecords.filter(r =>
                        (r["F.STAT"] || "").trim() === "COMPLETED"
                    )
                );
                
                // HANDLED
                const handled = getCounts(
                    techRecords.filter(r =>
                        (r["F.STAT"] || "").trim() === "HANDLED"
                    )
                );
                
                // UNHANDLED
                const unhandled = getCounts(
                    techRecords.filter(r =>
                        (r["F.STAT"] || "").trim() === "PENDING/UNHANDLED"
                    )
                );

                const row = document.createElement("tr");

                row.innerHTML = `
                
                <td class="first-col">
                    ${person[CX_NAME]}
                </td>
                
                <!-- DISPATCHED -->
                
                ${createDrillCell(dispatched.NC,"DISPATCHED","NC")}
                ${createDrillCell(dispatched.AO,"DISPATCHED","A/O")}
                ${createDrillCell(dispatched.IPTV,"DISPATCHED","IPTV")}
                ${createDrillCell(dispatched.NWUP,"DISPATCHED","NWUP")}
                ${createDrillCell(dispatched.RELOC,"DISPATCHED","RELOC")}
                ${createDrillCell(dispatched.AS,"DISPATCHED","AS")}
                
                ${createDrillCell(dispatched.WAR0,"DISPATCHED","WAR","0 D")}
                ${createDrillCell(dispatched.WAR1,"DISPATCHED","WAR","1 D")}
                ${createDrillCell(dispatched.WAR2,"DISPATCHED","WAR","2 D")}
                ${createDrillCell(dispatched.WAR3,"DISPATCHED","WAR","3 D")}
                ${createDrillCell(dispatched.WAR47,"DISPATCHED","WAR","4-7 D")}
                
                <!-- COMPLETED -->
                ${createDrillCell(completed.NC,"COMPLETED","NC")}
                ${createDrillCell(completed.AO,"COMPLETED","A/O")}
                ${createDrillCell(completed.IPTV,"COMPLETED","IPTV")}
                ${createDrillCell(completed.NWUP,"COMPLETED","NWUP")}
                ${createDrillCell(completed.RELOC,"COMPLETED","RELOC")}
                ${createDrillCell(completed.AS,"COMPLETED","AS")}
                
                ${createDrillCell(completed.WAR0,"COMPLETED","WAR","0 D")}
                ${createDrillCell(completed.WAR1,"COMPLETED","WAR","1 D")}
                ${createDrillCell(completed.WAR2,"COMPLETED","WAR","2 D")}
                ${createDrillCell(completed.WAR3,"COMPLETED","WAR","3 D")}
                ${createDrillCell(completed.WAR47,"COMPLETED","WAR","4-7 D")}
                
                <!-- HANDLED -->
                ${createDrillCell(handled.NC,"HANDLED","NC")}
                ${createDrillCell(handled.AO,"HANDLED","A/O")}
                ${createDrillCell(handled.IPTV,"HANDLED","IPTV")}
                ${createDrillCell(handled.NWUP,"HANDLED","NWUP")}
                ${createDrillCell(handled.RELOC,"HANDLED","RELOC")}
                ${createDrillCell(handled.AS,"HANDLED","AS")}
                
                ${createDrillCell(handled.WAR0,"HANDLED","WAR","0 D")}
                ${createDrillCell(handled.WAR1,"HANDLED","WAR","1 D")}
                ${createDrillCell(handled.WAR2,"HANDLED","WAR","2 D")}
                ${createDrillCell(handled.WAR3,"HANDLED","WAR","3 D")}
                ${createDrillCell(handled.WAR47,"HANDLED","WAR","4-7 D")}
                
                <!-- UNHANDLED -->
                ${createDrillCell(unhandled.NC,"PENDING/UNHANDLED","NC")}
                ${createDrillCell(unhandled.AO,"PENDING/UNHANDLED","A/O")}
                ${createDrillCell(unhandled.IPTV,"PENDING/UNHANDLED","IPTV")}
                ${createDrillCell(unhandled.NWUP,"PENDING/UNHANDLED","NWUP")}
                ${createDrillCell(unhandled.RELOC,"PENDING/UNHANDLED","RELOC")}
                ${createDrillCell(unhandled.AS,"PENDING/UNHANDLED","AS")}
                
                ${createDrillCell(unhandled.WAR0,"PENDING/UNHANDLED","WAR","0 D")}
                ${createDrillCell(unhandled.WAR1,"PENDING/UNHANDLED","WAR","1 D")}
                ${createDrillCell(unhandled.WAR2,"PENDING/UNHANDLED","WAR","2 D")}
                ${createDrillCell(unhandled.WAR3,"PENDING/UNHANDLED","WAR","3 D")}
                ${createDrillCell(unhandled.WAR47,"PENDING/UNHANDLED","WAR","4-7 D")}
                `;

                tbody.appendChild(row);

                const drillCells =
                    row.querySelectorAll(".drilldown");
                
                drillCells.forEach(cell => {
                
                    cell.addEventListener("dblclick", () => {
                
                        const status =
                            cell.dataset.status;
                
                        const soType =
                            cell.dataset.sotype;
                
                        const age =
                            cell.dataset.age;
                
                        const records =
                            techRecords.filter(r => {
                        
                                const statusMatch =
                                    status === "DISPATCHED"
                                        ? true
                                        : (r["F.STAT"] || "").trim() === status;
                        
                                const soTypeMatch =
                                    (r["SO TYPE"] || "").trim() === soType;
                        
                                const ageMatch =
                                    soType !== "WAR"
                                        ? true
                                        : (r["E.AGE"] || "").trim() === age;
                        
                                return (
                                    statusMatch &&
                                    soTypeMatch &&
                                    ageMatch
                                );
                        
                            });
                
                        showDrillDown(
                            `${person[CX_NAME]} | ${status} | ${soType} | ${age}`,
                            records
                        );
                
                    });
                
                });

            });

        });

    }

    // ==========================================
    // EVENTS
    // ==========================================
    searchBox.addEventListener("keyup", buildTable);

    clusterFilter.addEventListener("change", buildTable);

    statusFilter.addEventListener("change", buildTable);

    ageFilter.addEventListener("change", buildTable);
    
    lastMileFilter.addEventListener("change", buildTable);

    clearButton.addEventListener("click", () => {

        searchBox.value = "";
        clusterFilter.value = "ALL";
        statusFilter.value = "ALL";
        ageFilter.value = "ALL";
        lastMileFilter.value = "ALL";

        buildTable();

    });

});
