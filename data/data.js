const DATA = {
  "Programming": [
    {
      "heading": "Modulus",
      "image": "programming100.png",
      "paragraph": "In Python, what does print(17 % 5) display?",
      "a": "3",
      "b": "3.4",
      "c": "2",
      "d": "12",
      "answer": "c",
      "score": 100,
      "answerParagraph": "% gives the remainder after division. 5 fits into 17 three times (15), leaving 2."
    },
    {
      "heading": "Variable Scope",
      "image": "programming200.png",
      "paragraph": "Python sets x = 10, defines def update(): x = 20, calls update(), then prints x. What prints?",
      "a": "10",
      "b": "20",
      "c": "None",
      "d": "An error",
      "answer": "a",
      "score": 200,
      "answerParagraph": "Assigning a variable within a function creates a new local variable, leaving the global x untouched."
    },
    {
      "heading": "Nested Loop Trace",
      "image": "programming300.png",
      "paragraph": "Total = 0. A for loop runs i over 0, 1, 2, and inside it a second for loop runs j over range(i), adding j to total each time. What is printed?",
      "a": "0",
      "b": "1",
      "c": "3",
      "d": "6",
      "answer": "b",
      "score": 300,
      "answerParagraph": "The outer loop will run 3 times where i=0, then i=1, then i=2. When i=0 the inner loop doesn't run. When i=1, the inner loop adds 0 to total. When i=2, the inner loop adds 0 to total, then adds 1 to total. Thus, Total = 1."
    },
    {
      "heading": "Data Structure Choice",
      "image": "programming400.png",
      "paragraph": "A program repeatedly checks if a username exists in a list of 500,000 users, and it is far too slow. Which single change fixes it best?",
      "a": "Sort the list first so searches can run in order",
      "b": "Rewrite the whole program in a faster language",
      "c": "Store the users in a set instead of a list",
      "d": "Wrap each check in a try/except block",
      "answer": "c",
      "score": 400,
      "answerParagraph": "A list must be scanned item by item, so every check gets slower as the list grows. A set uses a technique called hashing that locates any member almost instantly regardless of size. Choosing the right data structure beats speeding up the code around it."
    },
    {
      "heading": "Mutable Defaults",
      "image": "programming500.png",
      "paragraph": "In Python, def add_item(item, items=[]) appends item to items and returns items. It is called twice, with 'a' then 'b'. What does the second call return?",
      "a": "['a']",
      "b": "['b']",
      "c": "['a', 'b']",
      "d": "An error",
      "answer": "c",
      "score": 500,
      "answerParagraph": "items is a default argument for add_item. Python evaluates the default [] once, when the function is defined, and attaches that single list to the function (it is not recreated on each call). Because the first call appends to it, by the second call it already contains ['a'] instead of being empty. The second call appends 'b', giving ['a', 'b']."
    }
  ],
  "Cyber Security": [
    {
      "heading": "Authentication Factors",
      "image": "cybersecurity100.png",
      "paragraph": "A one-time code from an authenticator app is which type of authentication factor?",
      "a": "Something you know",
      "b": "Something you have",
      "c": "Something you are",
      "d": "Somewhere you are",
      "answer": "b",
      "score": 100,
      "answerParagraph": "Possession factors are things you physically or digitally hold, like a phone or token. A one-time code cannot be known, nor is it fundamental to you. But a onetime code does prove you have the authentication app!"
    },
    {
      "heading": "Hashing vs Encryption",
      "image": "cybersecurity200.webp",
      "paragraph": "How should customer passwords be stored in a database?",
      "a": "Encrypted with the company's key",
      "b": "Base64-encoded",
      "c": "Plain text behind a strong admin password",
      "d": "Salted hash per user",
      "answer": "d",
      "score": 200,
      "answerParagraph": "Passwords should never be recoverable, not even by the company. Salted hashing can't be reversed and hides identical passwords; encryption is undone if the key leaks, and Base64 is just encoding."
    },
    {
      "heading": "Log Triage",
      "image": "cybersecurity300.jpg",
      "paragraph": "Logs show thousands of failed logins overnight from many different countries, all using valid usernames with common passwords. What is the most likely attack?",
      "a": "Credential stuffing",
      "b": "DDoS",
      "c": "Insider attack",
      "d": "Maintenance noise",
      "answer": "a",
      "score": 300,
      "answerParagraph": "The report shows many IPs, valid usernames, and common passwords. That combination suggests an attacker is replaying username-password pairs leaked from other sites. MFA would be a valid means of preventing this."
    },
    {
      "heading": "Least Privilege",
      "image": "cybersecurity400.jpg",
      "paragraph": "Ransomware infects one staff member's laptop. Which practice is most effective in preventing damage to the rest of the business?",
      "a": "Strong unique passwords",
      "b": "MFA",
      "c": "Principle of Least Privilege",
      "d": "Access Logs",
      "answer": "c",
      "score": 400,
      "answerParagraph": "A device with malware on it can only get as much access as the user's privilege allowed. This would limit the severity of damage based on the privilege of the user. Passwords and MFA won't prevent a device that is already logged in. Access logs don't prevent anything, only record it."
    },
    {
      "heading": "Response Order",
      "image": "cybersecurity500.jpg",
      "paragraph": "Files are actively being encrypted on shared drives right now. What is the correct first response?",
      "a": "Restore a backup",
      "b": "Isolate affected machines from the network",
      "c": "Find whoever takes responsibility and pay them a hefty ransom",
      "d": "Reboot servers",
      "answer": "b",
      "score": 500,
      "answerParagraph": "Containment comes before recovery. Restoring backups without isolating just means we get to watch it all get encrypted again. Rebooting potentially destroys evidence, and paying is expensive and provides no guarantees."
    }
  ],
  "Networking": [
    {
      "heading": "Gateway Role",
      "image": "networking100.webp",
      "paragraph": "A small office has an internal network of PCs and printers, plus an internet connection. Which device forwards traffic between the office LAN and the wider internet?",
      "a": "A router",
      "b": "A switch",
      "c": "A NAS box",
      "d": "A wireless access point",
      "answer": "a",
      "score": 100,
      "answerParagraph": "Routers connect different networks to each other. Switches connect devices inside one network. NAS is a storage endpoint. An access point extends Wi-Fi but doesn't route anything."
    },
    {
      "heading": "Fault Isolation",
      "image": "networking200.png",
      "paragraph": "A user can ping 8.8.8.8 successfully and the command completes in under 20ms, but no websites will load in any browser, and nslookup google.com times out. What is the most likely fault?",
      "a": "The network cable is unplugged",
      "b": "The router has died",
      "c": "The DNS resolver is unreachable or misconfigured",
      "d": "The browser is out of date",
      "answer": "c",
      "score": 200,
      "answerParagraph": "Raw IP connectivity works but turning names into addresses doesn't. This translation step indicates a DNS failure. A cable, or router problem would stop the IP ping in addition to the DNS. Browser is likely unrelated."
    },
    {
      "heading": "NAT and Remote Access",
      "image": "networking300.jpg",
      "paragraph": "From home, a technician tries to RDP to the office PC at 192.168.1.50 and it fails, even though the PC is switched on. From inside the office, RDP to that same PC works perfectly. Why does the connection fail from home?",
      "a": "192.168.1.50 is a private address",
      "b": "ISPs block RDP traffic",
      "c": "The office PC rejects home IP addresses",
      "d": "No port-forwarding rule has been established",
      "answer": "a",
      "score": 300,
      "answerParagraph": "Private addresses like 192.168.x.x aren't routable across the internet. Attempting to connect to 192.168.1.50 would connect you to a local device rather than anything outside your network."
    },
    {
      "heading": "Subnet Maths",
      "image": "networking400.svg",
      "paragraph": "Your team is given the address block 192.168.50.0/26 for the lab. How many usable host addresses does it provide, and what is its broadcast address?",
      "a": "62 usable; broadcast 192.168.50.63",
      "b": "62 usable; broadcast 192.168.50.255",
      "c": "64 usable; broadcast 192.168.50.255",
      "d": "126 usable; broadcast 192.168.50.127",
      "answer": "a",
      "score": 400,
      "answerParagraph": "A /26 leaves 6 bits for hosts. 2*2*2*2*2*2 = 64 addresses. Subtract the network address and the broadcast address leaves 62 usable, spanning .0 to .63."
    },
    {
      "heading": "APIPA Diagnosis",
      "image": "networking500.png",
      "paragraph": "A workstation can't reach anything on the network. The identical PC on the next desk works fine. On the broken machine, ipconfig shows its address as 169.254.6.2. What does this tell you?",
      "a": "The user set a static IP",
      "b": "Malware altered the settings",
      "c": "A normal address",
      "d": "DHCP failed and the machine self-assigned an address",
      "answer": "d",
      "score": 500,
      "answerParagraph": "169.254.x.x is a link-local address Windows gives itself (APIPA) when it asks DHCP for an address and gets no reply."
    }
  ],
  "IP, Ethics & Privacy": [
    {
      "heading": "Copyright Scope",
      "image": "ipethicsprivacy100.webp",
      "paragraph": "What does copyright protect?",
      "a": "Ideas themselves, as soon as someone thinks of them",
      "b": "The original expression of ideas, such as code, text and images",
      "c": "Physical hardware only",
      "d": "Works registered with a government office",
      "answer": "b",
      "score": 100,
      "answerParagraph": "Copyright attaches automatically to original expression with no registration needed. The underlying ideas, methods and facts remain free for anyone to use."
    },
    {
      "heading": "Ethical Escalation",
      "image": "ipethicsprivacy200.jpg",
      "paragraph": "During work placement you see your supervisor logging into the CEO's account to approve their own refunds. What is the most ethical response?",
      "a": "Stay quiet; the supervisor outranks you",
      "b": "Announce it publicly on social media",
      "c": "Don't take part, write down what you saw, and raise it through the organisation's reporting channel",
      "d": "Change the CEO's password yourself",
      "answer": "c",
      "score": 200,
      "answerParagraph": "Withdraw from the wrongdoing, record the facts, and escalate confidentially. Public accusations risk defamation, secretly changing systems is itself misconduct, and staying silent makes you complicit."
    },
    {
      "heading": "Data Breach Duty",
      "image": "ipethicsprivacy300.jpg",
      "paragraph": "Your employer loses a cool-looking USB drive containing clients' names, addresses and Medicare numbers. Under Australia's Notifiable Data Breaches scheme, what must happen?",
      "a": "Harm is likely, so notify the OAIC and the affected individuals",
      "b": "Harm is unlikely, so write an internal incident report",
      "c": "Punish the staff member!",
      "d": "Don't punish the staff member, it was an accident!",
      "answer": "a",
      "score": 300,
      "answerParagraph": "When a data breach is likely to cause serious harm, affected individuals and the OAIC must be notified as soon as practicable. Unencrypted health-related identifiers push it well past that threshold."
    },
    {
      "heading": "Contract IP Trap",
      "image": "ipethicsprivacy400.jpg",
      "paragraph": "A contractor builds a booking system for a gym. The contract says nothing at all about intellectual property. Who owns the copyright?",
      "a": "The gym, because they paid for it",
      "b": "Nobody until a licensing agreement is formed",
      "c": "The individual workers who wrote the code",
      "d": "The contractor, with the gym holding only an implied licence to use it",
      "answer": "d",
      "score": 400,
      "answerParagraph": "Paying for work does not transfer copyright; assignment must be in writing. The gap between owning code and merely being licensed to use it is a trap that trips up real businesses."
    },
    {
      "heading": "Clean-Room Software",
      "image": "ipethicsprivacy500.jpg",
      "paragraph": "A company wants to build a product that behaves exactly like a competitor's, without infringing copyright. In a clean-room approach, how is this organised?",
      "a": "Engineers study the competitor's product and reuse fragments of its code in new software",
      "b": "The competitor's code is read, deleted, and rewritten from memory",
      "c": "One team studies the product and writes a behaviour specification. A separate team implements code purely from that specification",
      "d": "Lawyers review the finished product only after release",
      "answer": "c",
      "score": 500,
      "answerParagraph": "Copyright protects the expression of a program, not its behaviour. So copying the features does not fall under copyright so long as the code isn't copied. The clean room design prevents this. Patented designs and methods are not prevented from a clean room approach."
    }
  ],
  "Cloud": [
    {
      "heading": "Service Models",
      "image": "cloud100.png",
      "paragraph": "Which cloud service model delivers complete ready-to-run applications over the internet, such as web-based email?",
      "a": "IaaS",
      "b": "PaaS",
      "c": "DaaS",
      "d": "SaaS",
      "answer": "d",
      "score": 100,
      "answerParagraph": "Software as a Service is a finished application you just use. IaaS rents raw infrastructure, PaaS provides a platform for building and deploying your own, and DaaS provides a virtual desktop."
    },
    {
      "heading": "Shared Responsibility",
      "image": "cloud200.png",
      "paragraph": "Attackers exploit an unpatched operating system on a company's IaaS virtual server and steal data. Who was responsible for patching that OS?",
      "a": "The cloud provider",
      "b": "The customer",
      "c": "Joint responsibility",
      "d": "This has never been resolved in a court",
      "answer": "b",
      "score": 200,
      "answerParagraph": "In IaaS the provider secures the physical and virtualised infrastructure, but the guest operating system, apps, data and access remain the customer's responsibility."
    },
    {
      "heading": "Data Residency",
      "image": "cloud300.webp",
      "paragraph": "A Sydney firm sets up a cloud service whose default region is US-East, but it will hold European customers' personal information. Why does the region choice matter?",
      "a": "Data sovereinity",
      "b": "Regions only affect download speed",
      "c": "The internet has no borders",
      "d": "GDPR bans Australian firms from EU data entirely",
      "answer": "a",
      "score": 300,
      "answerParagraph": "Storing EU residents' personal information overseas may breach the GDPR. Residency is a compliance decision, not just a performance one."
    },
    {
      "heading": "CapEx vs OpEx",
      "image": "cloud400.png",
      "paragraph": "A startup with unpredictable traffic that spikes up to 8x normal load must choose between buying a $15,000 server or renting equivalent cloud capacity at $450 per month. Which analysis is correct?",
      "a": "Rent cloud: monthly costs are predictable, so cloud is always cheaper",
      "b": "Buy the server: it pays for itself in under three years, and the spikes can be dealt with later",
      "c": "Weigh total cost of ownership against elasticity: the server is cheaper at steady load, but cloud absorbs 8x spikes without overbuilding",
      "d": "Ignore this option. I am required to provide 4 options",
      "answer": "c",
      "score": 400,
      "answerParagraph": "Raw cost actually favours the server — $450 a month overtakes $15,000 in under three years. The deciding factor is elasticity: an 8x spike on owned hardware means outage or emergency spending, while cloud scales up and bills only while the spike lasts."
    },
    {
      "heading": "Long term Vendor judgement",
      "image": "cloud500.jpg",
      "paragraph": "Before signing a three-year contract with a cloud vendor, which evaluation best protects the business long-term?",
      "a": "Choose the vendor with the largest community and support",
      "b": "Compare the per-gigabyte storage price",
      "c": "Check the vendor's projected price in 3 years",
      "d": "Assess how hard it would be to leave",
      "answer": "d",
      "score": 500,
      "answerParagraph": "Lock in contracts make leaving expensive. Organisations plan the exit path before signing anything, and cheap headline storage often hides large retrieval charges."
    }
  ]
};