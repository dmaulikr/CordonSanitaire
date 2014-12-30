<html lang="en" class="no-js">
	<head>
		<meta charset="utf-8">
		<title>Cordon Sanitaire | EZ Text Receipt</title>
		<meta name="description" content="">
		<meta name="keywords" content="" />
		<meta name="author" content="">
		<!-- !CSS -->
	</head>
	<body>
		<h3>Cordon Sanitaire | SMS Receipt</h3>
		<?php
			
		// pass this page some values, such as group to message, message text, and time to send text
		
		$sms_group = 'me';
		$sms_time = '15:05';
		
		if (isset($_GET['group'])) {
		     $sms_group = $_GET['group'];
		}else{
		    // Fallback behaviour goes here
		}	
		
		
		$data = array(
		    'User'          => 'jbobrow',
		    'Password'      => 'dmiHQzPp6Kxt3q',
		    'Groups'        => array($sms_group),
		    'Subject'       => '',
		    'Message'       => 'Playful FAKE URGENT. Patient Zero detected NYC Emergency contagion. At ' . $sms_time . ' EST (SOON), you&#39;ll have 2 mins to enact quarantine from a laptop. bit.ly/cordonsans',
		    'MessageTypeID' => 1
		);
		$curl = curl_init('https://app.eztexting.com/sending/messages?format=json');
		curl_setopt($curl, CURLOPT_POST, 1);
		curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($data));
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		
		// If you experience SSL issues, perhaps due to an outdated SSL cert
		// on your own server, try uncommenting the line below
		// curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
		$response = curl_exec($curl);
		curl_close($curl);
		$json = json_decode($response);
		$json = $json->Response;
		
		if ( 'Failure' == $json->Status ) {
		    $errors = array();
		    if ( !empty($json->Errors) ) {
		        $errors = $json->Errors;
		    }
		    echo 'Status: ' . $json->Status . "\n" .
		         'Errors: ' . implode(', ' , $errors) . "\n";
		} else {
		    $phoneNumbers = array();
		    if ( !empty($json->Entry->PhoneNumbers) ) {
		        $phoneNumbers = $json->Entry->PhoneNumbers;
		    }
		    $localOptOuts = array();
		    if ( !empty($json->Entry->LocalOptOuts) ) {
		        $localOptOuts = $json->Entry->LocalOptOuts;
		    }
		    $globalOptOuts = array();
		    if ( !empty($json->Entry->GlobalOptOuts) ) {
		        $globalOptOuts = $json->Entry->GlobalOptOuts;
		    }
		    $groups = array();
		    if ( !empty($json->Entry->Groups) ) {
		        $groups = $json->Entry->Groups;
		    }
		    echo 'Status: ' . $json->Status . "<br>" .
		         'Message ID : ' . $json->Entry->ID . "<br>" .
		         'Subject: ' . $json->Entry->Subject . "<br>" .
		         'Message: ' . $json->Entry->Message . "<br>" .
		         'Message Type ID: ' . $json->Entry->MessageTypeID . "<br>" .
		         'Total Recipients: ' . $json->Entry->RecipientsCount . "<br>" .
		         'Credits Charged: ' . $json->Entry->Credits . "<br>" .
		         'Time To Send: ' . $json->Entry->StampToSend . "<br>" .
		         'Phone Numbers: ' . implode(', ' , $phoneNumbers) . "<br>" .
		         'Groups: ' . implode(', ' , $groups) . "<br>" .
		         'Locally Opted Out Numbers: ' . implode(', ' , $localOptOuts) . "<br>" .
		         'Globally Opted Out Numbers: ' . implode(', ' , $globalOptOuts) . "<br>";
		}
		?>
	</body>
</html>