//
//  ViewController.m
//  CordonSanitaire
//
//  Created by Jonathan Bobrow on 1/8/15.
//  Copyright (c) 2015 Playful Systems. All rights reserved.
//

#import "ViewController.h"

@interface ViewController ()
@property (strong, nonatomic) IBOutlet UIWebView *webView;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    
    // Load a webpage
    NSString *address = @"http://bit.ly/cordonsans";
    
    // Parameters if necessary
    
    // Build the url and loadRequest
    NSString *urlString = [NSString stringWithFormat:@"%@",address];
    [self.webView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:urlString]]];
    [self.webView.scrollView setScrollEnabled:NO];
}

-(void)viewDidLayoutSubviews {
    self.webView.frame = self.view.frame;
    self.webView.center = self.view.center;
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
