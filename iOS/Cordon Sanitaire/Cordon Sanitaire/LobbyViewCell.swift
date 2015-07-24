//
//  LobbyViewCell.swift
//  Cordon Sanitaire
//
//  Created by Jonathan Bobrow on 3/18/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

import UIKit

class LobbyViewCell: UITableViewCell {
    
    override func awakeFromNib() {
        super.awakeFromNib()
        
        // Initialization code
    }

    override func setSelected(selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

    // CONFIGURE CUSTOM UITABLEVIEW
    /*
    
    var cellProfileImage = UIImageView()
    var cellName = UILabel()
    
    override init(style: UITableViewCellStyle, reuseIdentifier: String?) {
    super.init(style: .Default, reuseIdentifier: "cell" )
    self.contentView.addSubview(cellProfileImage)
    self.contentView.addSubview(cellName)
    }
    
    override func layoutSubviews() {
    cellProfileImage.frame = CGRectMake(0, 0, self.bounds.height, self.bounds.height)
    cellProfileImage.layer.cornerRadius = self.bounds.height/2
    cellName.frame = CGRectMake(10, 0, self.bounds.width - 10, self.bounds.height)
    
    }
    
    override func setSelected(selected: Bool, animated: Bool){
        super.setSelected(selected, animated:animated)
    }
    
    required init(coder aDecoder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
    }
    
*/
}
