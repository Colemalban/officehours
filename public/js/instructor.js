const socket=io({secure:!0}),client=feathers().configure(feathers.hooks()).configure(feathers.socketio(socket)).configure(feathers.authentication({cookie:"feathers-jwt"})),users=client.service("/users");function logout(){client.logout(),window.location.href="/login.html"}function updateStudentQueue(){client.service("/tokens").find({query:{fulfilled:!1}}).then(tickets=>{$("#student-table").find("tr:gt(0)").remove();var row=1,stable=$("#student-table")[0];tickets.data.map(ticket=>{var r=stable.insertRow(row);r.insertCell(0).innerHTML=row,r.insertCell(1).innerHTML=ticket.user.name||ticket.user.directoryID,r.insertCell(2).innerHTML=ticket.desc||"No description";var dateCell=r.insertCell(3);dateCell.innerHTML=formatTime(new Date(ticket.createdAt)),dateCell.classList.add("time"),dateCell.dataset.time=new Date(ticket.createdAt),row++}),$("#students-in-queue").html(tickets.total),$("#students-in-queue-sm").html(tickets.total)})}function renderUsers(users){$("#userTable").find("tr:gt(0)").remove();var row=1,utable=$("#userTable")[0];users.data.map(user=>{var r=utable.insertRow(row);r.insertCell(0).innerHTML=row,r.insertCell(1).innerHTML=user.directoryID,r.insertCell(2).innerHTML=user.name||user.directoryID,r.insertCell(3).innerHTML=user.role,client.get("user")._id!==user._id?r.insertCell(4).innerHTML="<a href=\"javascript:deleteUser('"+user._id+"')\">Delete ✖</a>":r.insertCell(4).innerHTML='<a style="color:gray;">Delete ✖</a>',row++})}function refreshUsers(){users.find({query:{$limit:5e3,$sort:{createdAt:-1}}}).then(results=>{renderUsers(results)}).catch(function(err){console.error(err)})}function deleteUser(user){window.confirm("Are you sure you want to permanently delete this user?")&&users.remove(user).then(res=>{refreshUsers()}).catch(function(err){console.error(err)})}function deleteAllStudents(){window.confirm("Are you sure you want to permanently delete ALL students?")&&deleteAllWithRole("Student")}function deleteAllTAs(){window.confirm("Are you sure you want to permanently delete ALL TA's?")&&deleteAllWithRole("TA")}function deleteAllWithRole(role){users.remove(null,{query:{role}}).then(res=>{refreshUsers()}).catch(function(err){console.error(err)})}function updateStats(){if(!cfg.statsAvailable)return;const lastMidnight=new Date;lastMidnight.setHours(0,0,0,0);const lastWeek=new Date;lastWeek.setDate(lastWeek.getDate()-7),$("#student-stats-well").hide(),client.service("/tokens").find({query:{createdAt:{$gt:lastMidnight.getTime()},$limit:0}}).then(res=>($("#stats-tix-today").html(res.total),client.service("/tokens").find({query:{createdAt:{$gt:lastWeek.getTime()},$limit:0}}).then(res=>($("#stats-tix-week").html(res.total),client.service("/tokens").find({query:{$limit:0}}))).then(res=>{$("#stats-tix-total").html(res.total),$("#student-stats-well").show()}).catch(function(err){console.err(err)})))}function search(){var filter,tr,td,i;for(filter=document.getElementById("searchBox").value.toUpperCase(),tr=document.getElementById("userTable").getElementsByTagName("tr"),i=0;i<tr.length;i++)(td=tr[i].getElementsByTagName("td")[2])&&(td.innerHTML.toUpperCase().indexOf(filter)>-1?tr[i].style.display="":tr[i].style.display="none");$("html, body").animate({scrollTop:$("#searchBox").offset().top},100)}function sortTable(n){var sortOrder=parseInt(document.getElementById("userTable").dataset.sortorder);document.getElementById("userTable").dataset.sortorder=-sortOrder+"";var field="createdAt";1===n?field="directoryID":2===n?field="name":3===n&&(field="role");var searchQuery={query:{$limit:5e3,$sort:{}}};searchQuery.query.$sort[field]=sortOrder,users.find(searchQuery).then(results=>{renderUsers(results)}).catch(function(err){console.error(err)})}client.authenticate().then(response=>(console.info("authenticated successfully"),client.set("jwt",response.accessToken),client.passport.verifyJWT(response.accessToken))).then(payload=>(console.info("verified JWT"),users.get(payload.userId))).then(user=>{console.log("user",user),"Instructor"!==user.role&&(window.location.href="/"),client.set("user",user),refreshUsers(),updateStats(),socket.on("tokens created",function(token){updateStudentQueue(),toastr.success("New ticket created")}),socket.on("tokens patched",function(token){updateStudentQueue(),toastr.success("Ticket status updated")}),socket.on("stats updated",function(stats){updateStats(),toastr.success("Analytics updated")}),updateStudentQueue()}).catch(error=>{console.log("auth error or not authenticated, redirecting...",error)}),toastr.options.closeDuration=8e3,toastr.options.positionClass="toast-bottom-right",$(function(){$("#delete-all-students").click(deleteAllStudents),$("#delete-all-tas").click(deleteAllTAs),$("#add-user").submit(function(e){e.preventDefault();var newUser={name:$("#add-user-name").val(),directoryID:$("#add-user-directoryid").val(),role:$("#add-user-role").find(":selected").text()};console.log(newUser),users.create(newUser).then(res=>{$("#add-user-name").val(""),$("#add-user-directoryid").val(""),refreshUsers()}).catch(function(err){console.error(err)})});document.getElementById("js-upload-form").addEventListener("submit",function(e){var files,form,uploadFiles=document.getElementById("js-upload-files").files;e.preventDefault(),files=uploadFiles,(form=new FormData).append("userfile",files[0]),$.ajax({url:"/csvUpload",type:"POST",data:form,cache:!1,contentType:!1,processData:!1,headers:{Authorization:client.get("jwt")},success:function(data,textStatus,jqXHR){toastr.success("Successfully created new users"),refreshUsers()},error:function(data,textStatus,jqXHR){console.log(data);let curErr=data.responseJSON.error.cause||"Malformed CSV";0===Object.keys(curErr).length&&curErr.constructor===Object&&(curErr="Malformed CSV"),toastr.error('CSV parse error: "'+curErr+'". Make sure the uploaded is formatted correctly and is < 5 MB'),console.log(data,textStatus,jqXHR)}})});var navItems=[];navItems[0]=$("#live-queue").position().top,navItems[1]=$("#student-stats").position().top,navItems[2]=$("#ta-stats").position().top,navItems[3]=$("#manage-user").position().top,navItems[4]=$("#roster").position().top;var navListSm=[];navListSm[0]=$("#live-queue-nav-sm"),navListSm[1]=$("#student-stats-nav-sm"),navListSm[2]=$("#ta-stats-nav-sm"),navListSm[3]=$("#manage-user-nav-sm"),navListSm[4]=$("#roster-nav-sm");var navListLg=[];navListLg[0]=$("#live-queue-nav-lg"),navListLg[1]=$("#student-stats-nav-lg"),navListLg[2]=$("#ta-stats-nav-lg"),navListLg[3]=$("#manage-user-nav-lg"),navListLg[4]=$("#roster-nav-lg");var selected=0;$(document).ready(function(){$(window).scroll(function(){const scrollLoc=$(this).scrollTop();var newSelected=0;scrollLoc>=0&&scrollLoc<navItems[1]?newSelected=0:scrollLoc>=navItems[1]&&scrollLoc<navItems[2]?newSelected=1:scrollLoc>=navItems[2]&&scrollLoc<navItems[3]?newSelected=2:scrollLoc>=navItems[3]&&scrollLoc<navItems[4]?newSelected=3:scrollLoc>=navItems[4]&&(newSelected=4),newSelected!=selected&&(navListLg[selected].removeClass("active"),navListSm[selected].removeClass("active"),navListLg[selected=newSelected].addClass("active"),navListSm[selected].addClass("active"))})})});
//# sourceMappingURL=instructor.js.map
