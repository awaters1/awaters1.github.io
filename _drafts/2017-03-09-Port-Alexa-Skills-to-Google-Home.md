---
layout: post
title: Port Alexa Skills to Google Home
published: true
---

Have an Alexa Skill? Want to use it with Google Home? Porting it may
be easier than you think, depending on how the Alexa Skill is implemented.
In this post I'll take advantage of Amazon's API Gateway to broker between
the Google Home action and the AWS Lambda function that handles skill invocations.

To begin, let me get some disclaimers out there, my skill is a very simple one from
the Amazon Alexa side, it only has one intent and one slot.  On the Google Home side
the action only takes in the raw text.  The backend, which runs through a Lambda function
handles the Natural Language Understanding (NLU).  The way that I brokered the
requests from Google Home appears to work correctly, but it hasn't been tested
extensively but should at least give you a head start in accomplishing something similar.

Now for the details, to start create a new API within Amazon's API Gateway, I named
mine google-home.  Next create a POST method and we want it to go to a Lamba Function.
Once that is done you will be taken to the screen that shows the data path through the system,
method request, integraton request, lambda, integration response, and method response.  Method request
will stay as is so open up integration request and expand Body Mapping Templates.  I chose
Never for the request body passthrough and added a mapping template to the content-type application/json.
The mapping template is below, it converts the necessary data from the Google Home Conversation API into
the Alexa Skills API.

{% highlight vtl %}
#set($inputRoot = $input.path('$'))
{
  "session" : {
    "sessionId" : "$inputRoot.conversation.conversation_id",
    "application" : {
      "applicationId" : "MyApplicationId"
    },
    #if($inputRoot.conversation.conversation_token && $inputRoot.conversation.conversation_token != '')
    "attributes" : $inputRoot.conversation.conversation_token,
    #{else}
    "attributes" : {},
    #end
    "user" : {
      "userId" : "$inputRoot.user.user_id"
    },
    "new" : "#if($inputRoot.conversation.type == 1)true#{else}false#end"
  },
  "request" : {
    "type" : "#if($inputRoot.conversation.type == 1)LaunchRequest#elseif($inputRoot.conversation.type == 2)IntentRequest#{else}StopRequest#end",
    "requestId" : "GoogleHomeRequest",
    "locale" : "en-US",
    "timestamp" : "2017-03-03T18:50:39Z"
    #if($inputRoot.conversation.type == 2),
    "intent" : {
      "name" : "MyIntentName",
      "slots" : {
        "MySlotName" : {
          "name" : "MySlotName",
          "value" : "$inputRoot.inputs[0].raw_inputs[0].query"
        }
      }
    }
    #end
  },
  "version" : "1.0"
}
{% endhighlight %}

The next step is to handle the conversion back, from the Alexa Skill to the Google Home action.  This mapping will go within
the Integration response, so add a new Body Mapping Template for the application/json content-type and copy the contents below.
An important piece to call out is that within the Google Home Conversation API they use a stringified JSON object to store
session data within conversation_token so we have to use ```$input.json``` and ```$util.escapeJavaScript``` to convert the session data.

{% highlight vtl %}
#set($inputRoot = $input.path('$'))
{ 
    "conversation_token": "$util.escapeJavaScript($input.json('$.sessionAttributes')).replaceAll("\\'","'")",
    "expect_user_response": #if($inputRoot.response.shouldEndSession)false#{else}true#end,
    #if($inputRoot.response.shouldEndSession)
    "final_response": {
       "speech_response": {
          "ssml": "$util.escapeJavaScript($inputRoot.response.outputSpeech.ssml).replaceAll("\\'","'")"
       }
    }
    #{else}
    "expected_inputs": [
        {
          "input_prompt": {
            "initial_prompts": [
              {
                "ssml": "$util.escapeJavaScript($inputRoot.response.outputSpeech.ssml).replaceAll("\\'","'")" 
              }
            ],
            "no_input_prompts": [
              {
                "ssml": "$util.escapeJavaScript($inputRoot.response.outputSpeech.ssml).replaceAll("\\'","'")" 
              }
            ]
          },
          "possible_intents": [
          {
            "intent": "assistant.intent.action.TEXT"
          }
        ]
        }
      ]
    #end
}
{% endhighlight %}

The last remaining piece that Google Home expects is the special ```Google-Assistant-API-Version``` header.  To set this first go 
to Method Response and add a header to with the name ```Google-Assistant-API-Version```.  Then go back to integration response
and add a header mapping for ```Google-Assistant-API-Version``` with the value ```'v1'```.  Lastly, deploy your API, copy the 
HTTPS url into action.json, and deploy it with the ```gaction``` CLI.

If all went well the Google Home Conversation API will contact the Amazon API Gateway, the gateway will convert the request
into an Alexa Skills Kit request, send it to your Lambda function, take the response from the Lambda function, convert it
from the Alexa Skills Kit response to a Google Home Conversation API response, set the correct HTTP header and 
deliver the results back to you.
