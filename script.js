
var url = "http://ec2-34-210-184-226.us-west-2.compute.amazonaws.com:3000"
//var url = "http://localhost:3000"


var player1id = ""
var player2id = ""
var head2headContainer
var single 
var player1value = ""
var player2value = ""

$(document).ready(function(){
    single = $("#singlePlayer")
    var twoPlayer = $("#twoPlayer")
    var singleDropdown = $("#playerdropdown")
    var singleProfile = $("#singleProfileContainer")
    var playervalue = ""

    head2headContainer = $("#head2headContainer")

    $("#modeToggle").click( function(){
        if( single.hasClass("hidden") ){
            single.removeClass("hidden")
            twoPlayer.addClass("hidden")
        } else {
            single.addClass("hidden")
            twoPlayer.removeClass("hidden")
            add2Listeners()
        }
    })

    var pinput = document.getElementById("player-input")
    pinput.addEventListener("input", function(e){
        e.preventDefault()
        if(e.inputType === "deleteContentBackward"){
            playervalue = playervalue.slice(0, playervalue.length - 1)
        } else {
            playervalue = playervalue + e.data
        }
        $("#player-input").val(playervalue)

        if(playervalue.length > 0){
            search(singleDropdown, playervalue, $("#player-input"), singleProfile, 0)
        } else {
            singleDropdown.empty()
        }
    })
})

function add2Listeners(){

    var player1Profile = $("#player1ProfileContainer")
    var player2Profile = $("#player2ProfileContainer")
    var player1dropdown = $("#player1dropdown")
    var player2dropdown = $("#player2dropdown")

    $("#head2headButton").click(function(e){
        e.preventDefault()
        if(player1id !== "" && player2id !== ""){
            getHead2HeadProfile(player1id, player2id)
        }
    })

    var p1input = document.getElementById("player1-input")
    p1input.addEventListener("input", function(e){
        e.preventDefault()
        if(e.inputType === "deleteContentBackward"){
            player1value = player1value.slice(0, player1value.length - 1)
        } else {
            player1value = player1value + e.data
        }
        $("#player1-input").val(player1value)

        if(player1value.length > 0){
            search(player1dropdown, player1value, $("#player1-input"), player1Profile, 1)
        } else {
            player1dropdown.empty()
        }
    })

    var p2input = document.getElementById("player2-input")
    p2input.addEventListener("input", function(e){
        e.preventDefault()
        if(e.inputType === "deleteContentBackward"){
            player2value = player2value.slice(0, player2value.length - 1)
        } else {
            player2value = player2value + e.data
        }
        $("#player2-input").val(player2value)

        if(player2value.length > 0){
            search(player2dropdown, player2value, $("#player2-input"), player2Profile, 2)
        } else {
            player2dropdown.empty()
        }
    })
}

function search(dropdown, string, input, target, id){
        
    $.ajax({
        type: "POST",
        dataType: "json",
        data: JSON.stringify({
            input: string
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
            "Content-Type": "application/json"
        },
        url: url + "/search",
        success: function(response){
            if(response.status === 200){
                dropdown.empty()
                response.data.data.forEach((item) => {
                    var x = $("<div>" + item.tag + "</div>")
                    x.addClass("dropDownOption")
                    x.click( function(){
                        getPlayerProfile(item, target)
                        input.val(item.tag)
                        dropdown.empty()
                        if(id === 1){
                            player1id = item.id
                        }
                        if(id === 2){
                            player2id = item.id
                        }
                    })
                    dropdown.append(x)
                })
            }
        },
        error: function(error){
            console.log("FAILURE", error)
        }
    })
}

function getPlayerProfile(player, target){
    
    $.ajax({
        type: "POST",
        dataType: "json",
        data: JSON.stringify({
            id: player.id,
            getHistory: true
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
            "Content-Type": "application/json"
        },
        url: url + "/playerProfile",
        success: function(response){
            if(response.status === 200){
                target.empty()
                target.append(generateProfileView(response.data))
            }
        },
        error: function(error){
            console.log("FAILURE", error)
        }
    })
}

function generateProfileView(data){
    var profile = $("<div>").addClass("playerProfile")
    var title = $("<h2>" + data.player.tag + "</h2>")
    var rank = $("<p>Elo Score: " + data.player.rank + "</p>")
    var sets = $("<p>Total Sets: " + data.sets.length + "</p>")
    profile.append(title)
    profile.append(rank)
    profile.append(sets)

    if( !single.hasClass("hidden") ){
        profile.append(generateSetsTable(data.sets))
    }
    
    return profile
}

function getHead2HeadProfile(id1, id2){
    $.ajax({
        type: "POST",
        dataType: "json",
        data: JSON.stringify({
            id1,
            id2
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
            "Content-Type": "application/json"
        },
        url: url + "/head2head",
        success: function(response){
            if(response.status === 200){
                head2headContainer.empty()
                head2headContainer.append(generateHead2HeadView(response.data))
            }
        },
        error: function(error){
            console.log("FAILURE", error)
        }
    })
}

function generateHead2HeadView(data){
    var profile = $("<div/>").addClass("head2headProfile")
    var title = $("<h2>" + data.player1.tag + " vs " + data.player2.tag + "</h2>")

    var scores = getSetCount(data)
    var sets = $("<p>Total Sets: " + data.sets.length + "</p>")
    var scoreTitle = $("<h3>Score:</h3>")
    var score = $("<div>" + scores.p1Count + " - " + scores.p2Count + "</div>")

    profile.append(title)
    profile.append(sets)
    profile.append(scoreTitle)
    profile.append(score)
    profile.append(generateSetsTable(data.sets))
    return profile
}

function generateSetsTable(sets){
    var setsTable = $("<table/>").addClass("setTable")
    var firstRow = $("<tr/>")
    firstRow.append("<td>Winner</td>")
    firstRow.append("<td>Loser</td>")
    firstRow.append("<td>Score</td>")
    setsTable.append(firstRow)
    sets.forEach((set) => {
        var row = $("<tr/>")
        row.append("<td>" + set.winner_tag + "</td>")
        row.append("<td>" + set.loser_tag + "</td>")
        row.append("<td>" + set.winner_score + "-" + set.loser_score + "</td>")
        setsTable.append(row)
    })
    return setsTable
}

function getSetCount(data){
    var p1Count = 0
    var p2Count = 0

    data.sets.forEach((set) => {
        if(set.winner_id === data.player1.id){
            p1Count++
        } else {
            p2Count++
        }
    })

    return { p1Count, p2Count}
}