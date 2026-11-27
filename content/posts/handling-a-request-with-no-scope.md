---
title: Handling a Request With No Scope
date: 2026-11-27
summary: "Lessons from turning a one-line request for in-app phone calls into a shipped feature in two weeks, from finding the real pain to the signed contract."
tags: [scope, product-development, voip, webrtc, zenvia, tech-leadership]
cover: /covers/handling-a-request-with-no-scope.svg
---

A request with no scope is a request that names the result and nothing else. Mine was one line: we want phone calls inside the platform. No users named, no provider, no deadline in writing, and no list of what was in or out.

That sounds like a problem, but it is also room to work. When nobody draws the box, you get to draw it, and you get to decide what "done" means (as long as you can explain why).

The funny part is what the work turned out to be. I spent two weeks building a way for our users to call their customers, and most of the hard part was getting someone to pick up on my side: a sales person to tell me the real pain, a vendor's support to answer a ticket, and the CEO to sign a contract (the irony was not lost on me).

The common approach is to read the line as a technical task: pick the best-known voice API, build it, and deliver exactly what was written. That fails because a one-line request usually hides a business pain, a vendor, a contract and people in other teams, and none of them are in the ticket. You can ship working code and still miss what the company needed.

In my case, the request was calls through a PABX (the phone system a company uses, today usually a cloud service that gives each person an extension) inside the SaaS where I am a tech lead. I owned it end to end, and in about two weeks it went live. This post is not a step-by-step tutorial but the lessons I took from it, and the short version is: find the real pain, pick the simplest model that fits it, and reach people through every channel you have.

We will go in five parts. First we find the real pain behind the request, then we choose how the call actually happens, then we get the first call through with a prototype, then we turn the prototype into a feature, and in the end we get the vendor to answer and the contract signed.

## Finding the Real Pain Behind the Request

A request with no scope starts with a question, not with code: what problem does this line solve, and for whom? This part is about getting that answer from the people closest to the customer, and in the end you have a scope small enough to ship and a reason for every cut.

### Talking to the Person Who Hears the Customer

Before opening any API documentation, I had a call with someone from sales, since they were the ones hearing customers ask for calls. I asked what the customers actually wanted to do, not which feature they had named.

The answer was simpler than the request. The pain was calling contacts from inside the platform, no matter which number the call came from. Nobody was asking for a full phone system, only for a way to stop switching tools in the middle of a conversation.

### Choosing PABX Over WhatsApp Calls

The same call settled the biggest decision of the project. Calls through WhatsApp were on the table too, but supporting them meant building the whole voice infrastructure ourselves, which is a project of its own.

A cloud PABX, on the other hand, already gives you extensions, numbers and the connection to the phone network. Since the pain was "call the contact", not "call through WhatsApp", the PABX solved it at a fraction of the effort, and WhatsApp calls went to the future list instead of the first version.

### Using a Competitor as the Spec

Sales also pointed me to a reference: Nectar, a Brazilian CRM, already had calls, and its users just clicked a contact and the call happened. One detail stood out: the caller number shown to the customer matched the area code (DDD, in Brazil) of the person being called, which makes people more likely to answer.

So instead of writing a spec from nothing, I wrote down what that product did and planned three steps. The first version would call from numbers provided by the vendor, matching the area code when possible; the next one would let customers use their own numbers; and calls through WhatsApp would come later, if ever.

### Planning the Two Weeks

With the pain clear, I split the two weeks by what each step needed from other people. First, understanding the problem with the real user (sales); then finding the simplest platform to integrate; then validating a working prototype with our Head of Revenue. After that, three things ran in parallel (hiring the vendor, prototyping the screens and developing the feature), and the last step was the launch.

## Choosing How the Call Happens

A browser call can work in very different ways, and the vendor comes only after you choose the way. This part compares the three models I found while looking at how other products did it, and in the end you know which question removes most of the options.

### Comparing the Three Models

At first I looked for "the simplest API to integrate", and I found three models that all look the same from the button the user clicks:

| Model                     | Where the audio goes                                                     | What the user needs                  | Example                                      |
| ------------------------- | ------------------------------------------------------------------------ | ------------------------------------ | -------------------------------------------- |
| Click-to-call by callback | The user's own phone: the system calls the user first, then the customer | A phone or extension in hand         | Simples Clique                               |
| External tab              | A web phone on the vendor's site, in another tab                         | An account and a login at the vendor | NVoip, the way Nectar integrates it          |
| Embedded web phone        | The browser, inside our own screen                                       | Nothing                              | Zenvia Voice (hidden mode), Twilio Voice SDK |

### Asking the One Question That Removes Options

The question that decided it was where the conversation happens. I wanted the user to talk through the computer, without picking up a phone and without leaving our screen, so the call had to go through the browser.

That single requirement removed two of the three models. Click-to-call needs a phone in the user's hand, and the external tab makes every customer of ours keep an account at another company, log in there and manage credits somewhere we do not control (a support ticket waiting to happen).

### Picking the Vendor Inside the Model

Only the embedded web phone was left, with two real options: the Twilio Voice SDK, where the browser runs the call through Twilio's JavaScript library, and Zenvia Voice, a Brazilian provider (formerly TotalVoice) whose web phone runs in a hidden iframe that you control with messages.

I chose Zenvia for an MVP for three reasons. It needs less setup (no SDK to wire, only a script and a few messages), it has Brazilian numbers and support in Portuguese, and it has a feature called Bina Inteligente (smart caller ID) that shows the customer a number with their own area code, which was exactly the detail sales had pointed out. Twilio stays as the option if one day we need more control than the iframe gives.

## Getting the First Call Through

A prototype that makes one real call is worth more than any spec, because it shows what the vendor's documentation left out. This part is the path from an empty HTML file to a call to someone in the company, and in the end you have the list of things that broke on the way (so they do not break on yours).

### Testing on a Personal Account First

I did not wait for a contract to start. I created a trial account at Zenvia with my own email, generated an access token in the panel and built a single HTML page with a number field, a call button and a log of every event the web phone sent back.

I wrote that page together with an AI assistant, which was fast for the boilerplate and confidently wrong about the details. Keep that in mind for the next step: most of my time went into finding which of its guesses did not match what the API really did.

### Reading What the Vendor Returns

The web phone works in two steps. Your backend asks the API for a signed URL, and the page loads that URL as a script, which creates a hidden iframe that runs the call. Here is everything that went wrong before it worked:

- **The old address.** Most examples online still use the TotalVoice API address from before the rename; the current one is `voice-api.zenvia.com`.
- **Two IDs for one extension.** The request failed with "Informe o ramal" (inform the extension) until I sent both the internal ID of the extension (`Id_ramal`) and its number (`ramal`).
- **A URL that expires.** The signed URL lasts 300 seconds (5 minutes), so it has to be generated when the user opens the call screen, never when the page loads.
- **The browser cannot call the API.** The API blocks cross-origin requests, so the call that gets the URL must come from the backend.
- **A container nobody mentions.** The script ran and created nothing, without any error. When I opened the JavaScript the URL returned, I saw it looks for an element with the ID `widget-evoline-api-container` and gives up quietly if it is missing.
- **A variable that never existed.** The assistant expected a global `window.webphone` and wrote code that waited for it. It was never there; the iframe the script creates has the ID `webphone`, and that is all you get.

The container fix is one line in the page:

```html
<div id="widget-evoline-api-container" style="display: none"></div>
```

The lesson I took from this list is not about Zenvia. When a call does nothing, read what the other side actually returned (the script, the response, the error message) before asking anyone, human or AI, to guess again.

### Activating the Account

With the web phone loading, the API answered "Ative sua conta para usar esta funcionalidade" (activate your account to use this feature). A trial account starts with R$ 10 of credit but cannot create extensions or make real calls until you add credit; as of May 2026 the minimum top-up was R$ 20, which is cheap enough to test without asking anyone for a budget.

### Calling Someone in the Company

The first real call went to our Head of Revenue, and I made it standing right in front of her, from a page that was still a debug log with a button. Her phone rang with the caller a few steps away, and she was in shock (it is hard to argue with a demo that calls you). Hearing the call connect through the browser, with no phone on the desk, was the moment the project stopped being an idea and became something people could react to.

That call was also the validation step. She saw the flow working before any screen was designed, so the conversation after it was about what the feature should look like, not about whether it was possible.

## Turning the Prototype Into a Feature

A prototype proves that a call works; a feature has to work for every user, look like the rest of the product and be cheap to run. This part covers the decisions between the first call and the launch, and in the end you have the shape of the whole integration.

### Giving Each User an Extension

In Zenvia, an extension (ramal) is a phone identity: a number, a login and a password that can make one call at a time. So the model is one extension per user, created by our backend through the API when the user turns calls on, with its IDs saved next to the user.

That is the same idea the reference CRM uses: the user never sees the vendor, never creates an account anywhere and never configures anything. Since creating an extension had no extra cost in our plan, we only pay for the minutes people actually talk.

### Keeping the Vendor Behind the Backend

The backend has a single job in the call flow: get a fresh signed URL for the user's extension and hand it to the front end. The page loads it, and from then on the call is controlled with messages to the iframe (`chamaNumero` to dial, `desligaChamada` to hang up), while the iframe sends back events like the call ID and its status (answered, ended, no answer, busy, failed).

```mermaid alt="How the browser call is set up, from the backend to the vendor's web phone"
flowchart TD
    A[User opens the call screen] --> B[Our backend asks Zenvia for a signed URL]
    B --> C[Front end loads the URL as a script]
    C --> D[Script creates the hidden web phone iframe]
    D --> E[Front end sends chamaNumero]
    E --> F[Iframe sends status events back]
```

One more thing to remember: if your app has a Content Security Policy, the vendor's domains must be allowed for scripts, frames and WebSocket connections, and `blob:` for media, or the browser may block them. In my case the policy was in report-only mode, so it only logged a warning, but it is the kind of thing that breaks the day someone turns enforcement on.

### Designing the Call Modal

With the flow working, I prototyped the screen: a modal with the contact's avatar, name and number and a green call button; while ringing, pulsing rings around the avatar and a red button to cancel; once answered, a timer, a red button to hang up and buttons for mute and the keypad. Claude Design saved me a lot of time here, since I could show product a clickable version in minutes instead of describing it.

Small words mattered too. While the web phone loads, my first label was "looking for signal", which reminds people of a phone with no coverage, so it became "preparing the call" (it says what is happening without making anyone worry).

### Validating the Scope With Product

I took the prototype to product. They changed a few things on the screens, but the functionality stayed what I had planned: the call screen, a report of the calls made and the recorded audio of each call.

Just as important was what stayed out, written down: receiving calls, using the customer's own numbers and calls through WhatsApp. Having that list made the two weeks possible, since every new idea had a place to go that was not this release.

### Launching With a Phone Call

For the launch, we used the feature to announce itself. Inside the platform, users opened a notice and got something like a phone call from our CEO telling them about the new feature, which explained it better than any release note.

## Getting the Vendor to Answer

A vendor's support queue is built for customers who already pay, so a company that is still deciding can wait days for an answer it needs in hours. This part is about not depending on one channel, and in the end you have the contract signed inside the same two weeks.

### Learning It From a Vendor That Never Answered

I learned this before the calls project. In an earlier integration, I needed to talk to NBS, an ERP for car dealerships, and their support did not answer at all: I sent emails and called from my phone, and nothing came back.

So I looked for a developer who worked there on LinkedIn and sent him a message. The same day, he had put me in touch with the right people inside the company, which the official channels had not done in 3 days. Since then, when a channel goes quiet, I open the next one instead of waiting.

### Opening Every Channel at Once

With Zenvia, I used every way in that I found: a support ticket, the chat, the chat inside the platform itself, and email with the team that activates accounts. In that first email I already asked the question that decided the whole model (whether one account could create many extensions, one for each of our users), so the answer could shape the design before I built more.

The channels did not talk to each other. The support ticket was passed to sales, sales asked for the company's details and who would sign the contract, and meanwhile support asked me for the number of a ticket from another team, and then closed mine for lack of a reply. My impression is that support is very slow for someone with nothing contracted yet; after signing it gets a little better, but it is still slow, so plan for it.

### Getting the Contract Signed

The contract was the step I expected to take longest, and it took the least. I read it first, then sent it to our CEO on Slack with my opinion: I had found no problem in it.

That worked because of trust built long before this project. I have been at the company for many years and I sit on its strategic committee as a tech lead, so a short message with a clear recommendation was enough. Keep in mind that this is the part you cannot build in two weeks: if you do not have that trust yet, send the contract with a one-page summary of the risks and the cost instead.

## What I Would Do Again

Looking back, I would not change much: the bumps along the way never turned into real problems, and the feature shipped in about two weeks. What I would repeat, in one sentence each:

- **Ask for the pain, not the feature.** One call with sales turned "phone calls" into "call the contact", and that removed WhatsApp calls from the first version.
- **Choose the model before the vendor.** The question "where does the conversation happen?" removed two of three models before I compared a single price.
- **Prototype before the contract.** A trial account and one HTML page showed what the documentation left out, and gave the people deciding something to react to.
- **Read what the other side returns.** The missing container was in the vendor's own script, not in any guess.
- **Use every channel at once.** When one goes quiet, the next one (even a developer on LinkedIn) may answer the same day.

If you just got a request with no scope, start this week with the conversation, not the code: find the person who hears the customer and ask what they are trying to do.

## References

- [How to integrate your system with Zenvia's hidden webphone](https://zenvia.com/blog/como-integrar-seu-sistema-com-o-webphone/)
- [TotalVoice web phone examples on GitHub](https://github.com/totalvoice/webphone-js)
- [Zenvia buys TotalVoice](https://zenvia.com/blog/zenvia-compra-totalvoice/)
- [How Nectar's Zenvia integration works](https://ajuda.nectarcrm.com.br/hc/pt-br/articles/28676590351507-Funcionamento-da-integra%C3%A7%C3%A3o-com-a-Zenvia)
