//
//  The Swift class above is only visible to React Native once it is announced
//  in Objective-C; these macros are what the bridge scans for.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (StilldoWidgets, NSObject)

RCT_EXTERN_METHOD(publish:(NSString *)json
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
