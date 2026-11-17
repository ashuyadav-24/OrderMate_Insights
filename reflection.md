# OrderMate -- Personal Reflection

### 1. What I Got Wrong at the Start

When I started this 24-hour sprint, I thought the main problem students
faced while ordering groceries was the delivery charge. My initial idea
was simple: if students could share the delivery fee, everyone would
save some money. But after visiting Hostel K between 10:00 AM and 11:30 AM and talking
to Aman Singh in Room E601, I realised that I hadn't understood the
problem properly.

He showed me his Flipkart Minutes checkout. He only wanted a ₹45 Nescafe
sachet and a ₹28 pouch of Amul milk because he was studying for his
placement test. However, the additional delivery, small cart, handling
and night surge charges came to around ₹65. Instead of paying those
charges, he decided to buy a bigger 100g Nescafe jar and extra milk
packs just to reach the ₹199 order threshold. In the end, he spent ₹181
extra on things he hadn't originally planned to buy.

This made me realise that the problem was bigger than just splitting
delivery charges. I also spoke to 24 other students from Block E and
Block F. Out of the 25 students I interviewed, 13 said they had done
something similar. That was when the actual idea behind OrderMate
started making sense to me. Students were spending more money on
unnecessary items just to avoid additional charges.

### 2. What I Would Cut

If I had to launch OrderMate on campus next week, there are a few
features I would remove straight away. The first would be automated
payment escrow, followed by complicated GPS tracking and map
integration.

While planning the project, it was tempting to add these features
because they seemed useful on paper. But after thinking about how things
actually work in a hostel, I don't think they are necessary. In Hostel
K, students can reach the main gate within a couple of minutes. There is
no real reason to track someone's live location when simply mentioning
"Hostel K, Block E" would be enough.

I would also avoid integrating a payment gateway for now. Almost
everyone already uses GPay or PhonePe. The person who creates the order
can pay for it, collect the items at the gate and share their UPI QR
code with the other students. They can settle their individual shares
directly.

I would rather spend time improving the group discovery feature, adding
a proper time limit for joining an order and making the chat experience
reliable. These are the things students would actually use. Adding too
many features at this stage would only make the application more
complicated.

### 3. Where AI Helped

AI tools were quite helpful during development, especially when I had to
build different parts of the application within a limited time.

I used AI to speed up the Socket.IO room logic, set up the Docker
multi-stage build with Nginx reverse proxying and write MongoDB
aggregation pipelines for the Analyzer dashboard. It also helped with
the Recharts components and Tailwind CSS styling.

Without AI, I would probably have spent a lot more time going through
documentation and fixing basic implementation issues. It allowed me to
get the initial structure working faster.

However, I didn't want to spend the entire sprint just generating code.
I also had to test whether the features actually worked and whether they
made sense for hostel students. The time saved during development gave
me more room to look at the feedback from the 25 students and work on
the actual problem.

### 4. Where AI Wasted Time

AI wasn't helpful every time. In fact, some of the issues it created
took quite a bit of time to figure out.

One example was the savings calculation. Initially, AI suggested
calculating savings based on the remaining cart amount required to get
free delivery. For example, if a student needed another ₹115 to qualify
for free delivery, it treated that amount as money saved. But that
doesn't make sense. Buying another ₹115 worth of products doesn't mean
someone has saved ₹115.

I had to correct the calculation so that actual savings were based on
the fees avoided minus the individual's share of the combined charges:

`Confirmed Savings = Fees Avoided - Share of Combined Charges`

Another issue came up with file paths. My script could read `data.csv`
when I ran it from the project root, but it started failing when I ran
it through Docker or from a different directory. The problem was with
relative paths and how `__dirname` was being handled. It took some
debugging to get that working properly.

The dashboard was another example. AI initially generated too many cards
and metrics, making it look more like a stock market dashboard than
something a student would quickly check before ordering milk at
midnight. I had to simplify the layout and remove information that
wasn't really useful.

Overall, AI helped me move faster, but I also learnt that generated code
cannot simply be trusted. I still needed to understand the logic, test
the output and decide what actually belonged in the application.
