const socket=io({secure:!0}),client=feathers().configure(feathers.hooks()).configure(feathers.socketio(socket)).configure(feathers.authentication({cookie:"feathers-jwt"})),taAlertTimeoutSeconds=10;function throttle(fn,threshhold,scope){var last,deferTimer;return threshhold||(threshhold=1e3),function(){var context=scope||this,now=+new Date,args=arguments;last&&now<last+threshhold?(clearTimeout(deferTimer),deferTimer=setTimeout(function(){last=now,fn.apply(context,args)},threshhold)):(last=now,fn.apply(context,args))}}toastr.options.closeDuration=12e3,toastr.options.positionClass="toast-bottom-right";const users=client.service("/users");function logout(){users.patch(client.get("user")._id,{onDuty:!1}).then(newMe=>{client.logout(),window.location.href="/login.html"}).catch(function(err){client.logout(),window.location.href="/login.html"})}function setPasscode(){client.service("passcode").get({}).then(result=>{$("#passcode").html(result.passcode)})}function setAvailableTAsHTML(availabletas){$("#num-tas").html(""+availabletas.total),$("#ta-table").find("tr").remove();var row=0,ttable=$("#ta-table")[0];availabletas.data.map(ta=>{ttable.insertRow(row).insertCell(0).innerHTML=ta.name||ta.directoryID,row++})}function setAvailableTAs(){client.service("/availabletas").find().then(availabletas=>{setAvailableTAsHTML(availabletas)})}function updateStudentQueue(){client.service("/tokens").find({query:{$limit:100,fulfilled:!1}}).then(tickets=>{$("#student-table").find("tr:gt(0)").remove();var row=1,stable=$("#student-table")[0];tickets.data.map(ticket=>{var r=stable.insertRow(row);r.insertCell(0).innerHTML=row,r.insertCell(1).innerHTML=ticket.user.name||ticket.user.directoryID,r.insertCell(2).innerHTML=ticket.desc||"No description";var dateCell=r.insertCell(3);dateCell.innerHTML=formatTime(new Date(ticket.createdAt)),dateCell.classList.add("time"),dateCell.dataset.time=new Date(ticket.createdAt),row++}),$("#students-in-queue").html(tickets.total),0==tickets.total?$("#student-dequeue-btn").hide():$("#student-dequeue-btn").show()})}function clockIn(){$("#student-queue-area").show(),$("#clock-in-area").hide(),$("#clock-out-area").show(),setAvailableTAs(),updateStudentQueue(),setPasscode(),getCurrentStudent()}function clockOut(){$("#student-queue-area").hide(),$("#clock-in-area").show(),$("#clock-out-area").hide(),setAvailableTAs()}function dequeueStudent(){client.service("dequeue-student").create({}).then(result=>{getCurrentStudent(),updateStudentQueue()}).catch(function(err){console.error(err)})}var currentTicket;function getCurrentStudent(){client.service("tokens").find({query:{$limit:1,fulfilled:!0,isBeingHelped:!0,fulfilledBy:client.get("user")._id,$sort:{createdAt:1}}}).then(ticket=>{ticket.total>=1?(showCurrentTicket(currentTicket=ticket.data[0]),$("#student-dequeue-btn").hide()):$("#current-student-area").hide()}).catch(function(err){console.error(err)})}function generateComment(comment){var result="";return comment?(comment.text&&(result+=comment.text+" "),"Not sure"!==comment.knowledgeable&&"Not sure"!==comment.toldTooMuch&&(result+="[From questionnaire]: "),"Yes"==comment.knowledgeable?(result+="Student seemed knowledgeable","Not sure"!==comment.toldTooMuch&&(result+=" -- ")):"No"==comment.knowledgeable&&(result+="Student did not seem knowledgeable","Not sure"!==comment.toldTooMuch&&(result+=" -- ")),"Yes"==comment.toldTooMuch?result+="Student may have been able to solve problem with less TA help":"No"==comment.toldTooMuch&&(result+="Student probably needed TA help to solve problem"),result):""}client.authenticate().then(response=>(console.info("authenticated successfully"),client.set("jwt",response.accessToken),client.passport.verifyJWT(response.accessToken))).then(payload=>(console.info("verified JWT"),users.get(payload.userId))).then(user=>{console.log("user",user),"Instructor"!==user.role&&"TA"!==user.role?window.location.href="/":"Instructor"===user.role&&$('<li><a href="/instructor.html">Instructor Home</a></li>').insertBefore("ul.nav>li:first"),client.set("user",user),user.onDuty?clockIn():clockOut(),socket.on("passcode updated",function(){setPasscode(),toastr.success("Passcode updated.",{timeout:3e5})}),socket.on("tokens created",function(token){updateStudentQueue(),toastr.success("New ticket created")}),socket.on("tokens patched",throttle(function(token){updateStudentQueue(),toastr.success("Ticket status updated")})),socket.on("availabletas updated",setAvailableTAsHTML),updateStudentQueue()}).catch(error=>{console.log("auth error or not authenticated, redirecting...",error),window.location.href="/login.html"}),String.prototype.trunc=function(n,useWordBoundary){if(this.length<=n)return this;var subString=this.substr(0,n-1);return(useWordBoundary?subString.substr(0,subString.lastIndexOf(" ")):subString)+"..."};var tooMuchTimeTimeout=void 0;function addMinutes(date,minutes){return new Date(date.getTime()+6e4*minutes)}function showCurrentTicket(ticket){client.service("tokens").find({query:{$limit:10,fulfilled:!0,isBeingHelped:!1,cancelledByStudent:!1,user:ticket.user._id,$sort:{createdAt:-1}}}).then(prevTickets=>{$("#prev-tickets-table").find("tr:gt(0)").remove();var row=1,stable=$("#prev-tickets-table")[0];prevTickets.data&&prevTickets.data.length>0&&prevTickets.data.map(ticket=>{var r=stable.insertRow(row),comment=generateComment(ticket.comment),desc=ticket.desc||"No description";r.insertCell(0).innerHTML="<small>"+row+"</small>";var dateCell=r.insertCell(1);dateCell.innerHTML="<small>"+formatTime(new Date(ticket.closedAt))+"</small>",dateCell.classList.add("timeSmall"),dateCell.dataset.time=new Date(ticket.closedAt),r.insertCell(2).innerHTML="<small>"+ticket.fulfilledByName||"N/A</small>",desc.length>60?r.insertCell(3).innerHTML='<small title="Full Description for #'+row+'" data-placement="bottom" data-toggle="popover" data-content="'+desc+'">'+desc.trunc(60,!0)+"</small>":r.insertCell(3).innerHTML="<small>"+desc+"</small>",comment.length>60?r.insertCell(4).innerHTML='<small title="All TA Comments for #'+row+'" data-placement="bottom" data-toggle="popover" data-content="'+comment+'">'+comment.trunc(60,!0)+"</small>":r.insertCell(4).innerHTML="<small>"+comment+"<small>",row++}),$("[data-toggle=popover]").popover({trigger:"hover"}),$("#current-student-name").html("Assisting: "+ticket.user.name),$("#current-student-name-2").html("Recent tickets for "+ticket.user.name),$("#current-student-issue-text").html(ticket.desc||"No description provided"),$("#current-student-ticket-createtime").html("Ticket created "+new Date(ticket.createdAt).toLocaleString()),$("#current-student-area").show();const alertTime=addMinutes(new Date(ticket.dequeuedAt),taAlertTimeoutSeconds),nowTime=new Date;alertTime<=nowTime?$("#current-student-time-warn").show():tooMuchTimeTimeout=setTimeout(function(){$("#current-student-time-warn").show()},alertTime-nowTime)}).catch(function(err){console.error(err)})}function closeTicket(){currentTicket&&window.confirm("Are you sure you want to permanently close this ticket?")&&($("#current-student-area").hide(),client.service("comment").create({text:$("#student-notes-box").val(),knowledgeable:$("input[name=radio1]:checked").val(),toldTooMuch:$("input[name=radio2]:checked").val(),student:currentTicket.user._id,ticket:currentTicket._id}).then(comment=>{client.service("tokens").patch(currentTicket._id,{isBeingHelped:!1,isClosed:!0,closedAt:Date.now(),comment:comment._id}).then(updatedTicket=>{$("#student-notes-box").val(""),tooMuchTimeTimeout&&(clearTimeout(tooMuchTimeTimeout),tooMuchTimeTimeout=void 0),$("#current-student-time-warn").hide(),toastr.success("Ticket closed and comment successfully saved"),currentTicket=null,updateStudentQueue()})}).catch(function(err){toastr.error("Error closing ticket and submitting comments"),console.error(err),currentTicket=null}))}function markNoshow(){currentTicket&&window.confirm("Warning: Marking this student as a no show. Are you sure?")&&($("#current-student-area").hide(),client.service("tokens").patch(currentTicket._id,{isBeingHelped:!1,isClosed:!0,noShow:!0,closedAt:Date.now()}).then(updatedTicket=>{$("#student-notes-box").val(""),toastr.success("Student marked as a no-show and ticket closed"),currentTicket=null,updateStudentQueue()}))}function endOH(){!currentTicket&&window.confirm("Warning: By ending office hours you will permanently cancel all tickets in the queue. Are you sure?")&&client.service("/tokens").find({query:{$limit:100,fulfilled:!1}}).then(tickets=>{tickets.data.map(ticket=>{client.service("tokens").patch(ticket._id,{cancelledByTA:!0,fulfilled:!0,fulfilledBy:client.get("user")._id,fulfilledByName:client.get("user").name,isClosed:!0,dequeuedAt:new Date,closedAt:new Date})})})}$(function(){$("#close-ticket-form").submit(function(e){e.preventDefault(),closeTicket()}),$("#noshow-form").submit(function(e){e.preventDefault(),markNoshow()}),$("#student-dequeue-form").submit(function(e){e.preventDefault(),dequeueStudent()}),$("#clock-in-form").submit(function(e){e.preventDefault(),users.patch(client.get("user")._id,{onDuty:!0}).then(newMe=>{toastr.success("You are now in office hours"),clockIn()})}),$("#clock-out-form").submit(function(e){e.preventDefault(),users.patch(client.get("user")._id,{onDuty:!1}).then(newMe=>{toastr.success("You are logged out of office hours"),clockOut()})})});
//# sourceMappingURL=ta.js.map
