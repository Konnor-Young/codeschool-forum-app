# codeschool-forum-app

-> create authentication _client side_.
-> several pages to take care of new users|returning users|logged in users
--> _Vue_ app front end

->ENDPOINTS

| GET thread : 'posts' (threads)
| GET thread/thread_id : 'comments' (posts)
| POST thread: thread name | description | category : new thread
| DELETE thread/thread_id : gone thread

| POST post: thread_id | body : new comment
| DELETE thread/thread_id/post/post_id : gone comment

-> create authentication _server side_.
-> server `serves` front-end
-->_Node_ app back end
