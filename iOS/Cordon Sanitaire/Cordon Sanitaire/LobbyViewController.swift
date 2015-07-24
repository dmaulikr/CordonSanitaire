//

//  Created by Jonathan Bobrow on 3/18/15.

//  Copyright (c) 2015 Playful Systems. All rights reserved.

//



import UIKit
import QuartzCore



class LobbyViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {
    
    var lobbyView: UITableView!
    var startTime = 0.0
    let duration = 60.0
    var timeLeft = 60.0
    var lobbyTimer = NSTimer()
    var bStartOfTimer: Bool = false
    var timerTextView: UITextView = UITextView()
    
    
    //TABLE VIEW
    func initTableView() {
        lobbyView = UITableView(frame: CGRectMake(20, 150, self.view.frame.width - 40, 2*self.view.frame.height/3), style: UITableViewStyle.Plain)
        lobbyView.layer.cornerRadius = 10
        lobbyView.registerClass(LobbyViewCell.self, forCellReuseIdentifier: "cell")
        
        //lobbyView.frame = CGRectMake(20, self.view.frame.height/3, self.view.frame.width - 40, self.view.frame.height/3)
        
        lobbyView.delegate = self
        lobbyView.dataSource = self
    }
    
    override func viewDidLoad() {
        
        super.viewDidLoad()
        
        var background = UIView(frame: self.view.frame)
        background.backgroundColor = UIColor(netHex: cs_navy)
        self.view.addSubview(background)
        
        addText()
        lobbyTimer = NSTimer.scheduledTimerWithTimeInterval(0.01, target: self, selector: Selector("updateTimer"), userInfo: nil, repeats: true)
        initTableView()
        
        self.view.addSubview(lobbyView)
        
        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false
        
        // Uncomment the following line to display an Edit button in the navigation bar for this view
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()
        
    }
    
    override func didReceiveMemoryWarning() {
        
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    // MARK: - Table view data source
    func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        
        // #warning Potentially incomplete method implementation.
        // Return the number of sections.
        return 1
    }
    
    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        // #warning Incomplete method implementation.
        // Return the number of rows in the section.
        return Lobby.singleton.players.count
    }
    
    
    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        var cell = lobbyView.dequeueReusableCellWithIdentifier("cell") as! LobbyViewCell?
        if (cell == nil){
            cell = LobbyViewCell()
        }
        //cell!.cellName.text = Lobby.singleton.players.keys.array[indexPath.row]
        cell!.textLabel?.text = Lobby.singleton.players.keys.array[indexPath.row]
        return cell!
        
    }
    
    
    func update(){
        if (lobbyView != nil) {
            self.lobbyView.reloadData()
        }
    }
    
    func addText(){
        let backBar = UIView(frame: CGRectMake(0, 0, self.view.frame.width, 70.0))
        backBar.backgroundColor = UIColor(netHex: cs_blue)
        self.view.addSubview(backBar)
        

        timerTextView.frame = CGRectMake(10, 10, self.view.frame.width/2, 60.0)
        self.view.addSubview(timerTextView)
        timerTextView.backgroundColor = UIColor(netHex: cs_blue)
        timerTextView.textColor = UIColor.whiteColor()
        timerTextView.font = UIFont(name: "HelveticaNeue-Bold", size: 36.0)
        timerTextView.text = "00:00.00"
        timerTextView.selectable = false
        timerTextView.editable = false
        self.view.addSubview(timerTextView)
        
        let untilTextView = UITextView(frame: CGRectMake(self.view.frame.width/2 + 10, 15, self.view.frame.width/2 - 20, 55.0))
        untilTextView.backgroundColor = UIColor(netHex: cs_blue)
        untilTextView.textColor = UIColor.whiteColor()
        //untilTextView.textAlignment = NSTextAlignment.Center
        untilTextView.font = UIFont(name: "HelveticaNeue-Bold", size: 15.0)
        untilTextView.text = "until\nnext quarantine"
        untilTextView.selectable = false
        untilTextView.editable = false
        self.view.addSubview(untilTextView)
        
        let localTextView = UITextView(frame: CGRectMake(10, 85, self.view.frame.width, 50))
        localTextView.backgroundColor = UIColor.clearColor()
        localTextView.textColor = UIColor.whiteColor()
        localTextView.font = UIFont(name: "HelveticaNeue-Bold", size: 28.0)
        localTextView.text = "Citizens in your area"
        localTextView.selectable = false
        localTextView.editable = false
        self.view.addSubview(localTextView)
        
        
        let credits = UILabel(frame: CGRectMake(0, self.view.frame.height - 30, 160, 20))
        credits.center = CGPointMake(self.view.frame.width/2, self.view.frame.height - 15)
        credits.text = "MIT Media Lab | Playful Systems"
        credits.font = UIFont(name: "helvetica neue", size: 10)
        credits.textColor = UIColor(netHex: cs_blue)
        credits.alpha = 0.7
        self.view.addSubview(credits)
        
    }
    
    func updateTimer() {
        
        if(!bStartOfTimer){
            startTime = NSDate().timeIntervalSince1970
            bStartOfTimer = true
        }
    
        timeLeft = duration - (NSDate().timeIntervalSince1970 - startTime)
        
        if(timeLeft < 0.0) {
            lobbyTimer.invalidate()
            timerTextView.text = "00:00.00"
            println("timer finished")
        }
        else {
            timerTextView.text = NSString(format: "00:%@%.2f", (timeLeft < 10.0) ? "0" : "", timeLeft) as String
        }
    }

    
    /*
    
    // Override to support conditional editing of the table view.
    override func tableView(tableView: UITableView, canEditRowAtIndexPath indexPath: NSIndexPath) -> Bool {
    // Return NO if you do not want the specified item to be editable.
    return true
    
    }
    
    */
    /*
    
    // Override to support editing the table view.
    
    override func tableView(tableView: UITableView, commitEditingStyle editingStyle: UITableViewCellEditingStyle, forRowAtIndexPath indexPath: NSIndexPath) {
    
    if editingStyle == .Delete {
    
    // Delete the row from the data source
    
    tableView.deleteRowsAtIndexPaths([indexPath], withRowAnimation: .Fade)
    
    } else if editingStyle == .Insert {
    
    // Create a new instance of the appropriate class, insert it into the array, and add a new row to the table view
    
    }
    
    }
    
    */
    
    
    
    /*
    
    // Override to support rearranging the table view.
    
    override func tableView(tableView: UITableView, moveRowAtIndexPath fromIndexPath: NSIndexPath, toIndexPath: NSIndexPath) {
    
    
    
    }
    
    */
    
    
    
    /*
    
    // Override to support conditional rearranging of the table view.
    
    override func tableView(tableView: UITableView, canMoveRowAtIndexPath indexPath: NSIndexPath) -> Bool {
    
    // Return NO if you do not want the item to be re-orderable.
    
    return true
    
    }
    
    */
    
    
    
    /*
    
    // MARK: - Navigation
    
    
    
    // In a storyboard-based application, you will often want to do a little preparation before navigation
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
    
    // Get the new view controller using [segue destinationViewController].
    
    // Pass the selected object to the new view controller.
    
    }
    
    */
    
    
    
}

