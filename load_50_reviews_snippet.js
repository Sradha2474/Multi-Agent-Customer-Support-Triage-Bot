const reviews = [
  {
    "id": 1,
    "product_name": "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan (Sm",
    "rating": 1,
    "review_summary": "Useless product",
    "review_text": "It is worst fan don't by this fan",
    "uploaded_at": "2024-09-02 03:12:00"
  },
  {
    "id": 2,
    "product_name": "Inalsa Inox 1000 1000 W Food Processor (Silver:Black)",
    "rating": 2,
    "review_summary": "Expected a better product",
    "review_text": "Don't waste your money. I'm really doubtful of all the positive reviews, as this product is just not good. The plastic used is cheap and 1 of the lids was broken on arrival. I don't think this will last long with daily use. It was a big disappointed to get this.",
    "uploaded_at": "2024-09-03 21:12:00"
  },
  {
    "id": 3,
    "product_name": "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan (Sm",
    "rating": 5,
    "review_summary": "Best in the market!",
    "review_text": "Nice 1 day delivery good packing also good thanks to ekart also good speed easy installation you can do by your self",
    "uploaded_at": "2024-09-03 03:00:00"
  },
  {
    "id": 4,
    "product_name": "boAt Blitz 1500 Multimedia 50 W Bluetooth Home Theatre ",
    "rating": 3,
    "review_summary": "Fair",
    "review_text": "As compared to money, this home theater is good.",
    "uploaded_at": "2024-09-05 08:12:00"
  },
  {
    "id": 5,
    "product_name": "boAt Blitz 1500 Multimedia 50 W Bluetooth Home Theatre ",
    "rating": 1,
    "review_summary": "Worst experience ever!",
    "review_text": "low quality low bass don't buy no return policy only replace west of money boat company is best but this product is west.",
    "uploaded_at": "2024-09-02 08:48:00"
  },
  {
    "id": 6,
    "product_name": "Scotch-Brite Plastic Dry Broom (Green)",
    "rating": 3,
    "review_summary": "Nice",
    "review_text": "The product build quality is good but it has bigger plastic strands. The sweeping experience is not same as normal broom. Suggest to have thinner fibres for better sweeping effect",
    "uploaded_at": "2024-09-05 19:24:00"
  },
  {
    "id": 7,
    "product_name": "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan (Sm",
    "rating": 5,
    "review_summary": "Classy product",
    "review_text": "Good finish. Excellent performance. Speed is really 400 rpm. This is my 3rd purchase of this model.",
    "uploaded_at": "2024-09-02 21:24:00"
  },
  {
    "id": 8,
    "product_name": "UPC Upgraded Hands-Free Squeeze Microfiber Flat Spin Mo",
    "rating": 5,
    "review_summary": "Classy product",
    "review_text": "Excellent mop far better than regular round shape mop It will easily goes in the corners and very easy to use.",
    "uploaded_at": "2024-09-02 20:00:00"
  },
  {
    "id": 9,
    "product_name": "boAt Blitz 1500 Multimedia 50 W Bluetooth Home Theatre ",
    "rating": 5,
    "review_summary": "Classy product",
    "review_text": "Awesome i am happy my biggest diwali gifttt",
    "uploaded_at": "2024-09-03 05:48:00"
  },
  {
    "id": 10,
    "product_name": "Crompton 75 L Desert Air Cooler (White, Teal, ACGC-DAC7",
    "rating": 5,
    "review_summary": "Wonderful",
    "review_text": "Very good quality product. Better than my expectations. If you provide good ventilation it does nice cooling then. I could feel the air 25 feet away. Couldn't try more than that but i think you could feel it a bit more far away as well. Water easily lasts for about 8-9 hours. Good in this price(9200) range after 10 percent discount.",
    "uploaded_at": "2024-09-02 11:36:00"
  },
  {
    "id": 11,
    "product_name": "Crompton 75 L Desert Air Cooler (White, Teal, ACGC-DAC7",
    "rating": 5,
    "review_summary": "Perfect product!",
    "review_text": "Air throw is very good. Low noise and best cooling on medium speed. Motor of Fan is partially covered with plastic to protect water fall on it. Original Crompton motor very durable. Water Level can be seen clearly from outside body of cooler. You can fill water very easily from front side of cooler, a big box is available to open and close it after filling water. 55 litre tank is enough for 10 hours cooling. Honey comb pads very good quality. Plastic body is ...",
    "uploaded_at": "2024-09-02 01:48:00"
  },
  {
    "id": 12,
    "product_name": "Crompton 75 L Desert Air Cooler (White, Teal, ACGC-DAC7",
    "rating": 2,
    "review_summary": "Waste Cooler",
    "review_text": "Don't buy this stupid cooler, very annoying creek sound of fan in cooler and very very short cable... and also very horrible smell for intial 30mins.",
    "uploaded_at": "2024-09-01 14:36:00"
  },
  {
    "id": 13,
    "product_name": "DDARSH ENTERPRISE Wet and Dry Duster Set",
    "rating": 1,
    "review_summary": "Useless product",
    "review_text": "It is not flexible I don't like it",
    "uploaded_at": "2024-09-03 15:36:00"
  },
  {
    "id": 14,
    "product_name": "DDARSH ENTERPRISE Wet and Dry Duster Set",
    "rating": 1,
    "review_summary": "Very poor",
    "review_text": "Very cheap and poor quality",
    "uploaded_at": "2024-09-01 20:12:00"
  },
  {
    "id": 15,
    "product_name": "Green Home Reusable Latex Hand Gloves for Kitchen Black",
    "rating": 2,
    "review_summary": "Could be way better",
    "review_text": "Not good,I hve used only 10 days nd it I'll damage",
    "uploaded_at": "2024-09-01 13:12:00"
  },
  {
    "id": 16,
    "product_name": "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan (Sm",
    "rating": 4,
    "review_summary": "Pretty good",
    "review_text": "Good high speed fan in this price, I bought Orient also, that's good also but it has good design in it.",
    "uploaded_at": "2024-09-01 17:24:00"
  },
  {
    "id": 17,
    "product_name": "boAt Blitz 1500 Multimedia 50 W Bluetooth Home Theatre ",
    "rating": 2,
    "review_summary": "Expected a better product",
    "review_text": "Voice not clear when increase volume more than 10....not worth for the cost",
    "uploaded_at": "2024-09-04 09:48:00"
  },
  {
    "id": 18,
    "product_name": "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan (Sm",
    "rating": 3,
    "review_summary": "Decent product",
    "review_text": "At first delivery boy who has no seance even he didn't know what is exchange process which was in offer and his behaviour was also poor.After 1 day using the product u can say its moderate cause speed is very fast but air flow not good. Need to stand just 90 below to get some air. Fan is much silent compare to it's speed. One thing i can say crompton is good but usha is the best. I'll go for usha next time. Thank you all.",
    "uploaded_at": "2024-09-05 13:48:00"
  },
  {
    "id": 19,
    "product_name": "Inalsa fiesta 650 W Food Processor (White)",
    "rating": 3,
    "review_summary": "Just okay",
    "review_text": "prodect same part good same part quality not good Customer support call number not pickup over all not good",
    "uploaded_at": "2024-09-05 15:12:00"
  },
  {
    "id": 20,
    "product_name": "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan (Sm",
    "rating": 4,
    "review_summary": "Delightful",
    "review_text": "Reviewing after 2 months.. worth buying..Happy customer :)",
    "uploaded_at": "2024-09-02 06:00:00"
  },
  {
    "id": 21,
    "product_name": "UPC Upgraded Hands-Free Squeeze Microfiber Flat Spin Mo",
    "rating": 5,
    "review_summary": "Perfect product!",
    "review_text": "Mop built quantity very good",
    "uploaded_at": "2024-09-01 21:36:00"
  },
  {
    "id": 22,
    "product_name": "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan (Sm",
    "rating": 5,
    "review_summary": "Must buy!",
    "review_text": "Nice products ...fan speed look like ac ..full cool",
    "uploaded_at": "2024-09-02 07:24:00"
  },
  {
    "id": 23,
    "product_name": "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan (Sm",
    "rating": 1,
    "review_summary": "Utterly Disappointed",
    "review_text": "Worst product first time bad experience with Flipkart.Worst packaging and blades are bend looked as used product.I have raised return request but didn't get picked up of the fan yet. I hope it will retun soon I trust flipkart.Thank you",
    "uploaded_at": "2024-09-02 18:36:00"
  },
  {
    "id": 24,
    "product_name": "Crompton 75 L Desert Air Cooler (White, Teal, ACGC-DAC7",
    "rating": 1,
    "review_summary": "Utterly Disappointed",
    "review_text": "Never purchase cooler from FlipkartMy 10500 wastedPump not working, honey comb dry,not giving cool air,the up and down slider is also not working when you manually do it up it Will go down itself after few minutes giving only air in downwardI am a regular Flipkart customer and was trusting Flipkart but after this cooler purchasing experience i hate Flipkart from now and I'll never do any order at FlipkartI've requested for return that was 7 days replacement policy butTechnician came and...",
    "uploaded_at": "2024-09-03 08:36:00"
  },
  {
    "id": 25,
    "product_name": "boAt Blitz 1500 Multimedia 50 W Bluetooth Home Theatre ",
    "rating": 4,
    "review_summary": "Value-for-money",
    "review_text": "Thanks flipkart nice product",
    "uploaded_at": "2024-09-03 04:24:00"
  },
  {
    "id": 26,
    "product_name": "Sheen Microfiber cleaning cloth pack of 6 Dry Cotton Cl",
    "rating": 4,
    "review_summary": "Really Nice",
    "review_text": "Very nice n soft .it is worth for money.",
    "uploaded_at": "2024-09-01 09:00:00"
  },
  {
    "id": 27,
    "product_name": "Sheen Microfiber cleaning cloth pack of 6 Dry Cotton Cl",
    "rating": 3,
    "review_summary": "Just okay",
    "review_text": "Quality is ok but small size",
    "uploaded_at": "2024-09-04 22:24:00"
  },
  {
    "id": 28,
    "product_name": "Crompton 75 L Desert Air Cooler (White, Teal, ACGC-DAC7",
    "rating": 3,
    "review_summary": "Fair",
    "review_text": "genuine feedback- cooler is not so cool, but below average, it can prevent only the hot air blown by nature. during hot climate in summer u can get the air like rainy day nothing else,",
    "uploaded_at": "2024-09-02 22:48:00"
  },
  {
    "id": 29,
    "product_name": "CEAT Hitman Full Size Double Blade Poplar Cricket Bat -",
    "rating": 2,
    "review_summary": "Expected a better product",
    "review_text": "Not bad good product but need to be maintain",
    "uploaded_at": "2024-09-03 07:12:00"
  },
  {
    "id": 30,
    "product_name": "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan (Sm",
    "rating": 4,
    "review_summary": "Pretty good",
    "review_text": "Super fine look and Lesser in noisemaking, but the fan upper cover and condenser fan guards made of plastics was not there on 3 of 1 so little bit disappointed. The Crompton super briz at it s best",
    "uploaded_at": "2024-09-01 16:00:00"
  },
  {
    "id": 31,
    "product_name": "boAt Blitz 1500 Multimedia 50 W Bluetooth Home Theatre ",
    "rating": 4,
    "review_summary": "Worth the money",
    "review_text": "Bass is poor.. Bulid quality is very good.Suitable for 10 10 roomBluetooth connection is more than 30 M.. Excellent .Sound quality good.I suggest improve bass woofer quality and safe guard provision for protecting speakers.",
    "uploaded_at": "2024-09-03 01:36:00"
  },
  {
    "id": 32,
    "product_name": "Inalsa Easy Prep_ 800 W Food Processor (Black)",
    "rating": 2,
    "review_summary": "Moderate",
    "review_text": "Plastic attachments is very poor guilty",
    "uploaded_at": "2024-09-02 00:24:00"
  },
  {
    "id": 33,
    "product_name": "Crompton 75 L Desert Air Cooler (White, Teal, ACGC-DAC7",
    "rating": 3,
    "review_summary": "Nice",
    "review_text": "Pros, the best cooling out there with 75L liter capacity. And plastic used is also really good. Cons, plugg in cable length is not even half meter and huge noise which will not allow you to sleep. So what is the point. It is like giving you an AK47 without bullet. You have a wonderful gun but you cannot use it for the purpose you got it for.",
    "uploaded_at": "2024-09-03 14:12:00"
  },
  {
    "id": 34,
    "product_name": "Donizard store Wet and Dry Glove Set (Free Size Pack of",
    "rating": 1,
    "review_summary": "Don't waste your money",
    "review_text": "Very poor quality of this product !Waste of money",
    "uploaded_at": "2024-09-01 10:24:00"
  },
  {
    "id": 35,
    "product_name": "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan (Sm",
    "rating": 5,
    "review_summary": "Classy product",
    "review_text": "Crompton product needs no introduction.Great value for moneyProspowerful motorCoverage(covers more area of your room)Less noisySuper anti corrosion ColoradoGood LookingConsCould not find one",
    "uploaded_at": "2024-09-02 14:24:00"
  },
  {
    "id": 36,
    "product_name": "Spotzero by Milton Refill (Grey)",
    "rating": 4,
    "review_summary": "Worth the money",
    "review_text": "This product is good. And delivery is very good. It delivered very soon. But it is some hard to fix",
    "uploaded_at": "2024-09-01 11:48:00"
  },
  {
    "id": 37,
    "product_name": "Crompton 75 L Desert Air Cooler (White, Teal, ACGC-DAC7",
    "rating": 3,
    "review_summary": "Just okay",
    "review_text": "Writing this review after using this cooler for 4+ months in Nagpur (where temperature goes till 48 degrees and is an extremely hot region).Light weight, sturdy, stylish, does not make a lot of noise either. This cooler will work absolutely fine until March. But during the months of April and May, when summer will be at its peak, it will work only as a personal cooler, and you'll have to keep it hardly 1 meter away from yourself to feel the cool air.",
    "uploaded_at": "2024-09-04 18:12:00"
  },
  {
    "id": 38,
    "product_name": "Sheen Microfiber cleaning cloth pack of 6 Dry Cotton Cl",
    "rating": 1,
    "review_summary": "Terrible product",
    "review_text": "Very bad Quality, please don't buy",
    "uploaded_at": "2024-09-03 12:48:00"
  },
  {
    "id": 39,
    "product_name": "DDARSH ENTERPRISE Wet and Dry Duster Set",
    "rating": 4,
    "review_summary": "Nice product",
    "review_text": "Good Product. Thanks Flipkart.",
    "uploaded_at": "2024-09-02 17:12:00"
  },
  {
    "id": 40,
    "product_name": "USHA FP 3811_ 1000 W Food Processor (Black, Silver)",
    "rating": 2,
    "review_summary": "Moderate",
    "review_text": "Juicer is not good at all, it spread out I put with little output. Noisy",
    "uploaded_at": "2024-09-04 08:24:00"
  },
  {
    "id": 41,
    "product_name": "Crompton 75 L Desert Air Cooler (White, Teal, ACGC-DAC7",
    "rating": 1,
    "review_summary": "Item is good but Delhivery courier service worst.",
    "review_text": "Item is good but Delivery service of flipkart Delhivery courier service is worst.",
    "uploaded_at": "2024-09-01 23:00:00"
  },
  {
    "id": 42,
    "product_name": "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan (Sm",
    "rating": 3,
    "review_summary": "Decent product",
    "review_text": "I did not receive mounting bracket. I bought 3 ceiling fans of which 2 had mounting bracket but missing in one ceiling fan.",
    "uploaded_at": "2024-09-02 15:48:00"
  },
  {
    "id": 43,
    "product_name": "Crompton 75 L Desert Air Cooler (White, Teal, ACGC-DAC7",
    "rating": 4,
    "review_summary": "Delightful",
    "review_text": "Product is delivered before time from FK's Gurugram warehouse to Noida. It was received in good condition however few scratches were visible when delivered.Product is very good and working as expected. Cooling 200 sqft drawing room of my flat in hot summer (End of April) of noida city. Cool air circulation can be felt even at far ends of the room. Look of the cooler is also decent (finishing is not that fine at corners) and very easy to move within the room or outside.Full water tank goes e...",
    "uploaded_at": "2024-09-02 10:12:00"
  },
  {
    "id": 44,
    "product_name": "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan (Sm",
    "rating": 3,
    "review_summary": "Decent product",
    "review_text": "Not happy with the packing. This chances for damages during Transit.Not good white colour. It's blueish.There is a bend in leaf. It's looks a difected product selling in discount.",
    "uploaded_at": "2024-09-06 13:36:00"
  },
  {
    "id": 45,
    "product_name": "Crompton Hill Briz Deco 1200 mm 3 Blade Ceiling Fan (Sm",
    "rating": 5,
    "review_summary": "Highly recommended",
    "review_text": "best fan in such a price range.",
    "uploaded_at": "2024-09-02 13:00:00"
  },
  {
    "id": 46,
    "product_name": "Crompton 75 L Desert Air Cooler (White, Teal, ACGC-DAC7",
    "rating": 2,
    "review_summary": "Expected a better product",
    "review_text": "Not good cooling . Please improve product quality.",
    "uploaded_at": "2024-09-01 18:48:00"
  },
  {
    "id": 47,
    "product_name": "Butterfly Cresta 4 Jars 750 W Food Processor (Turquoise",
    "rating": 2,
    "review_summary": "Not good",
    "review_text": "Making lot of Noise, not worth for the price and service center no reponse",
    "uploaded_at": "2024-09-04 12:36:00"
  },
  {
    "id": 48,
    "product_name": "Spotzero by Milton Refill (Grey)",
    "rating": 4,
    "review_summary": "Pretty good",
    "review_text": "The product is good and worthy price... You can surely go for it....",
    "uploaded_at": "2024-09-02 04:36:00"
  },
  {
    "id": 49,
    "product_name": "Crompton 75 L Desert Air Cooler (White, Teal, ACGC-DAC7",
    "rating": 2,
    "review_summary": "Not much chilling.just okk",
    "review_text": "Buy only if maximum temperature in your city under 40 degree. If more than this temperature doesnt work this cooler.working like a fan,not chilling your room. Not much setisfactory like iron desort cooler. Much disappointed after here temperature of 42-45 degrees.",
    "uploaded_at": "2024-09-03 00:12:00"
  },
  {
    "id": 50,
    "product_name": "PAPILON EMULSION PACK OF 6 BOTTLES 20ML EACH Mixed Frui",
    "rating": 1,
    "review_summary": "Waste of money!",
    "review_text": "Don't buy. The taste is really bad. It ruined my cake",
    "uploaded_at": "2024-09-03 18:24:00"
  }
];

return reviews.map(r => ({ json: r }));
