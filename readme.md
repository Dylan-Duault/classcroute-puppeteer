# Classcroute Puppeteer

You didn't prepare food and are to busy to order ? No worries !


This bot will do all the work for you. Just make sure you have the money on you to pay the delivery guy.

## Variable Configurations

You have to create a .env file with your settings. Take this one as an example:

```
CLASSCROUTE_USER=contact@dylan-duault.com
CLASSCROUTE_PASSWORD=YOUR_PRIVATE_PASSWORD
TIME_OF_DELIVERY=12h

SANDWITCH=gladiateur
DRINK=fraise
DESSERT=muffin

CAN_BUY=FALSE
```

TIME_OF_DELIVERY will match 12h15, 12h30 and 12h45.

## How does this work ?
I used a library name Puppeteer to control a headless browser.

## Disable security measure
You have to set CAN_BUY to true in order to let the script order to food.
