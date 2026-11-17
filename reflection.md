# OrderMate – Personal Reflection

### 1. What I Got Wrong at the Start
When I started this 24-hour sprint, I had a very naive assumption: I thought hostel students were mainly annoyed about paying ₹20 or ₹25 for delivery. I figured if we just helped them split a delivery charge, they'd be happy. 

Going down to Hostel L around 11:30 PM and talking to Aman Singh in Room E601 completely shattered that view. Aman showed me his Flipkart Minutes checkout: he only wanted a ₹45 sachet of Nescafe and a ₹28 pouch of Amul milk to study for his placement test. But the app was hitting him with delivery, small cart penalty, handling, and night surge fees totaling ₹65—almost doubling his bill. Because paying ₹65 in fees felt painful, he ended up buying a large 100g Nescafe jar and extra milk packs he didn't need just to cross ₹199. He literally spent an extra ₹181 out of pocket just to avoid a ₹65 fee. When I collected data from the other 24 guys across Block E and Block F, more than half of them (13 out of 25) were doing the exact same thing. The real problem wasn't a ₹25 delivery fee—it was the massive financial leak from forced cart-stuffing.

### 2. What I Would Cut
If I had to build this for real campus deployment next week, I would immediately cut the automated in-app payment escrow ideas and complex GPS map pinning. 

In a senior hostel like Hostel L, students literally walk down the stairs to the main gate in slippers within two minutes. Nobody needs live GPS coordinates or map tracking; a simple tag saying "Hostel L, Block E" is more than enough context. Similarly, trying to handle payment gateways inside the app is overkill—everyone on campus already uses GPay or PhonePe. The creator just pays the rider at the gate, shows their UPI QR to the joiners when handing over the packet, and settles up in five seconds. Keeping the app focused purely on time-limited cart discovery and a clean chatroom is 10x better than building bloated checkout flows.

### 3. Where AI Helped
AI was genuinely a huge timesaver for full-stack scaffolding. It helped me write the boilerplate Socket.IO room logic, set up the Docker multi-stage build with Nginx reverse proxying, and write clean MongoDB aggregation pipelines for the Analyzer dashboard. Writing the Recharts frontend components and styling them quickly with Tailwind CSS would have taken me hours of digging through documentation alone, but AI handled the UI layout rapidly, letting me spend more time actually talking to students and analyzing the 25 fieldwork rows.

### 4. Where AI Wasted Time
AI caused headaches whenever it made assumptions about business logic instead of looking at reality. For example, it kept trying to calculate "savings" by simply taking the remaining cart amount (e.g., ₹115 needed for free delivery) and counting it as saved money, which is mathematically false—buying things isn't saving money. I had to strictly correct the formula so that confirmed savings is strictly `(fees avoided - share of combined charges)`. 

Another place it wasted time was with subtle file-path bugs: reading `data.csv` worked fine when running the script from the root folder, but broke inside Docker and subdirectories because of relative `__dirname` navigation. It also generated an overly complicated set of dashboard cards initially that made the screen look like a stock trading platform rather than a fast, practical tool a student would check on their phone before ordering milk at midnight.
