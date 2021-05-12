### 1. What would you add to your solution if you had more time?

- Learn about how orderbooks work more, I listened to my intuition but I am pretty sure the exact way things are calculated might be different
- Add scrollable table. I just noticed that the example project supports scrolling. I lost some time trying two figure out what they're doing with the order's that do not fit into the container. Initially I started incorporating them using different ways - waste of time, though it was fun ;)
- Proper mobile support, rn it's not acceptable on every device. It would require some UI redesign though.

### 2. What would you have done differently if you knew this page was going to get thousands of views per second vs per week?

I guess there are two implications of a much higher traffic:

1. The server has to serve much more requests.  
   To offload our infrastructure a bit I would focus on reducing the bundle size. Less bytes to transfer per page view means our server can start processing other requests quicker. I would also see if I am not opening any new TCP connections where it can be prevented (I could reuse the existing ones).
2. Increased variety of devices, user contexts (e.g. users with slow internet connection, users with disabilities)  
   Again reducing bundle size might help the users with limited bandwidth. I also would focus much more on accessibility, make sure the colors are easily distinguished by ppl with all sorts of eyesight problems, make sure screen readers are reading through the content properly etc.

### 3. What was the most useful feature that was added to the latest version of your chosen language? Please include a snippet of code that shows how you've used it.

I guess `Template Literal Types` are kinda cool in TS 4.2.  
I haven't used them in this project but in my current work project - yes.
I was able to implement API for DB transaction that infers the datatype from the path to document (yep it's NoSQL ;)). Sth like that:

```typescript
mutate({
  reads: [`users/${userID}/friends/${friendID}`],
  writes: [
    (friend /* This is inferred as Friend type*/) => ({
      ref: `users/${userID}`,
      change: {
        likesFrom: ArrayOp.union(friend.name),
      },
    }),
  ],
});
```

Though I have to admit we ended up having special field like "collection" for this, as the code ended up much simpler.

### 4. How would you track down a performance issue in production? Have you ever had to do this?

Yes I've had a chance to look for perf bottlenecks. I have never tried tracking them down on production. If it's sth easily reproducible I would try to recreate the environment locally (copy the DB state for a user etc.). Then I would start from React Profiler. I could see what components render after some state change, and more importantly how long did it take. If sth takes too long I go deeper and investigate.

If for some reason we cannot reproduce it locally and it only happens on production then I would look for long tasks in JS profiler - see when the event loop is blocked for too long. I would observe the framerate as the interaction happens and see if it's immediate (sync processing) or in reaction to some data being fetched.

### 5. Can you describe common security concerns to consider for a frontend developer?

- XSS - let's not render user inputted data directly in html, because an attacker can leverage that to execute code on our website and in result steal some data from other users for example.
- CSRF - if we use cookies for storing our session tokens let's make sure we use CSRF tokens to properly authenticate the request sender
- User inputted data in general, for example if we allow for user inputted image url's and then render them mindlessly we basically allow attacker's for making request from other client's. They can use that to gather user info, such as IP's. Or if we experience huge traffic they could DDos some small website that's not ready for it.
- Server header's for preventing rendering our website in IFrames
- Some other Same-origin policy related considerations. E.g what if our server host's documents inputted by the user

### 6. How would you improve the API that you just used?

I guess in it's current form it's not taking into account how often do we want to update the UI. It's sending requests at a much higher rate than the user can observe a difference. To offload our client's machine I would batch event's on the server side and send them every 100ms or so.

I suppose it's not meant for UI's but rather for trading bot's etc. basically for client's that care for minimum latency.
