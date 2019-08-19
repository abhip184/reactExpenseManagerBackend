$(document).ready(function(){
  var userId;
      $('#signUpForm').on('submit', function(){
        var email = $('#email').val();
        var password = $('#password').val();
        var firstName = $('#first_name').val();
        var lastName = $('#last_name').val();
          $.ajax({
            type: 'POST',
            url: 'users/signup',
            data:{email: email, password:password, firstName:firstName, lastName,lastName},
            success: function (data) {
              Cookies.set('email', data.email);
              Cookies.set('userId', data.userId);
              Cookies.set('firstName', data.firstName);

              console.log(data.userId)
              userId = data.userId;
              console.log("userid is" + userId);
              M.toast({ html: data.message })
              $('#signUpRow').addClass("hide")
              $('#userGreting').val(firstName)
              $('#defaultAccountRow').removeClass("hide")
            },
            error:function (xhr, ajaxOptions, thrownError, data){
              if(xhr.status>=300) {
                var data = JSON.parse(xhr.responseText);
                M.toast({ html: data.message })
              }
          }
          });
    
         return false;
    
      });

      $('#defaultAccountForm').on('submit', function(){
        alert(userId)
        console.log();
        var name = $('#account_name').val();
        var amount = $('#account_amount').val();
          $.ajax({
            type: 'POST',
            url: 'accounts',
            data:{accountName:name, currentBalance:amount, owner:userId},
            success: function (data) {
              window.location.href= "/login";
            },
            error:function (xhr, ajaxOptions, thrownError, data){
              if(xhr.status>=300) {
                var data = JSON.parse(xhr.responseText);
                M.toast({ html: data.message })
              }
          }
          });
    
         return false;
    
      });
    
    //   $('li').on('click', function(){
    //       var item = $(this).text().replace(/ /g, "-");
    //       var $li = $(this).closest("li");
    //       $.ajax({
    //         type: 'DELETE',
    //         url: '/todo/' + item,
    //         success: function(data){
    //           //do something with the data via front-end framework
    //           $li.fadeOut(500, function(){
    //             $(this).remove();
    //           })
    //         }
    //       });
    //   });
    
    });
    