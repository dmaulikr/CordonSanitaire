<html lang="en" class="no-js">
	<head>
		<meta charset="utf-8">
		<title>Cordon Sanitaire | EZ Text Receipt</title>
		<meta name="description" content="">
		<meta name="keywords" content="" />
		<meta name="author" content="">
		<meta http-equiv='cache-control' content='no-cache'>
		<meta http-equiv='expires' content='0'>
		<meta http-equiv='pragma' content='no-cache'>
		<!-- !CSS -->
	</head>
	<body>
		<h3>Cordon Sanitaire | SMS Receipt</h3>
		<?php
			
		// pass this page some values, such as group to message, message text, and time to send text
		
		$sms_group = 'no_group';
		$sms_time =  '00:00';
		$sms_url = 'bit.ly/playCSbeta';
		
		if (isset($_GET['group'])) {
		     $sms_group = $_GET['group'];
		}
		if (isset($_GET['time'])) {
		     $sms_time = $_GET["time"];
		}	
		if (isset($_GET['sms_url'])) {
		     $sms_url = $_GET["sms_url"];
		}	
		
		$message = 'PLAYFUL URGENT. Patient Zero detected, no one knows where! USE YOUR PHONE NOW to enact quarantine ' . $sms_url . ' - ' . $sms_time;
		/*
		 *	A nice GitHub page with all EZ-Text PHP examples - source code
		 *	
		 *	https://github.com/EzTexting/php-code-samples/blob/master/send_message_json.php
		 *
		 */
		
		$data = array(
		    'User'          => 'jbobrow',
		    'Password'      => 'dmiHQzPp6Kxt3q',
		    'Groups'        => array($sms_group),
		    'Subject'       => '',
		    'Message'       => $message,
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