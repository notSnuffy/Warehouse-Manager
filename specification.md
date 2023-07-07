# _Specification_ #
## **Editors** ##
### **Introduction** ##
The first thing that is needed is the ability to design the floor plant of a warehouse or similar space. Good existing application that represents what I expect from a room designer is RoomSketcher. The main functionalities of this application are editing walls and adding furniture. The application's functionality to add windows, doors and materials is not really required for my application, as it only needs to have the layout of the room, specifically the position of the furniture. Additionally, it only needs the furniture that is capable to store some items. 

### Floor ###
Firstly, what I expect from my application is for the wall adding to work in the same way, but I would remove the display of exact wall length. The meter is not needed because, as I have mentioned earlier, my application only requires a rough layout of the entire floor. For wall editing, I would opt for a simpler option instead of the sophisticated one that RoomSketcher has. RoomSketcher can edit walls by detecting if the wall is split by another wall, and in that case, the edit only affects the chosen split of the wall. In my application, wall editing would not be implemented in that way. I would require the user to delete the entire wall in order to readjust it(_I am not really sure about this; perhaps implementing split editing might be easier, and I am overcomplicating it_). Finally, at the end, we should receive a prompt asking us to give the layout a name.

### Furniture ###
For the furniture editing, I expect something similar. The user will see all the furniture he has created, but when he places them, they will not have any sophisticated design, just a simple shape of some color with a tag showing what it is. This leads me to the furniture editor.

Regarding the furniture editor, I actually could not find any application specifically for 2D furniture design. This makes sense since something like Microsoft Paint is more than enough to create a front view of a furniture. That is why I believe it is sufficient to provide the user with access to  basic shapes (lines, rectangles, etc.) which he can use to create furniture. I think basic shapes are enough since, again, we only need a rough sketch of the furniture. Special ornaments created using advanced shapes on the furniture are not necessary for the functionality of my application. The only additional requirement for the user would be to select the places on the furniture where items can be stored. To achieve this, I would create something similar to the filler tool in Paint, allowing the user to select these places (for example, if we have a cabinet, we  would select the doors since items can be placed behind them). 

These selected places could then be further edited. If we choose not to edit them, then the space behind the doors is considered as one large area for items. If we decide to edit, we will have the possibility to add shelves by dividing this large space into smaller compartments. This is why I would include a feature similar to the wall adding feature mentioned earlier, as it can be utilised here as well.

After the user finishes editing using all the previous furniture editor features, the user will be moved to a simple editor that allows him to choose the top-down view of the furniture. This is what the user will use in the floor layout editor.

Finally, the user will choose the tag for the furniture, which concludes the whole editing process for the furniture. Additionally, there should be an option to delete the furniture from the furniture menu. Furthermore, users should have the ability to create a new piece of furniture, as well as the option to create a copy of existing furniture. Creating a copy will immediately initiate editing of the copied furniture. However, editing the already finished piece of furniture should not be allowed, as it could potentially cause issues if the furniture has already been added to our floor layout and items have been added to it. In such cases, the application could crash.

### Items ###
The item editor should be accessible by, for example, clicking on the furniture in the floor layout and then selecting one of the areas designated for items in the front view of the furniture. The editor will now provide advanced shapes to accommodate the various shapes an item can have. Afterward, the item can be placed anywhere within the designated area, but there should be a simple check in place to prevent the item from floating. Whenever a new item is placed, a prompt should appear, allowing us to choose a name for the item so that it can be queried later.

## Query ##
Somewhere on the main page, there should be a query box that allows us to search for item names. The application should then highlight all the layouts this item appears. After choosing one of the layouts, the furniture that contains this item should be highlighted. Upon selecting the furniture, the specific placements of the item should be highlighted. Finally, the item itself should be highlighted within the designated area, allowing us to find the exact location of the item.

## Item list ##
For a specific layout, the user should be able to retrieve the list of all the items withing this layout.

## Authentication ##
There should be at least a simple authentication system implemented since we do not want the information about the locations of the items to be accessible accessible to all users.

## Technical aspects ##
I want the application to be a web application using JavaScript and PHP as the primary programming languages. For libraries, I have found PixiJS, which is a 2D web renderer that also allows interactions. I chose this library because it has thorough documentation and hopefully includes all the necessary features. I did not select Phaser, a full-fledged game engine, because its current documentation is lacking. It might have been a good idea to consider using one of the 3D engines, such as Three.js or Babylon.js, for potential future expansion into the 3D space. However, since they do not natively support 2D, I did not choose them (although 2D is still possible with some workarounds). 

The drawback of using PixiJS is that it does not provide built-in UI functionality. Therefore, I will use React for the user interface, as PixiJS has support for React. Additionally, PixiJS does not include any storage mechanisms, so I will utilise a database. Considering that most of the data will be in JavaScript, I believe a document database will be more suitable. Therefore, I have decided to use MongoDB and MongoExpress for database management. 

To serve the application, I plan to run PHP on an Apache server, utilizing Composer for library installations. For REST API routing, I think Slim would be a good option. As for the frontend, I believe a Node server should suffice (although this may change). Finally, I would like to implement all of this within a Docker container for easier deployment and management.

## Comparison ##
From my research on similar applications, I have found that they mostly focus on tracking inventory rather than specific item locations. For example, home inventory management or household organization apps do exist, but they primarily focus on maintaining item counts. However, what often happens to me is that I know an item should be somewhere in the house, but I can never seem to find it. My application can easily solve this issue because all you need to do is query the item you are looking for, and it will provide you with the exact location. This concept could also be beneficial in shopping centers. Instead of searching the entire centre, you can simply look up the item in the app, if the centre has it, and immediately know where to go. 

I can imagine there may be some challenges with manual management in my application, as most inventory managers automate processes. Even in home inventory apps, barcode scanners are utilized, although manual management is also common (not everything at home has barcode). This means that if a person forgets they threw something out, it will remain a ghost item in the system. Additionally, the setup process for inventorying a home in my application may be tedious for some users. The requirement to manually create layouts and furniture could be time-consuming and discourage some users from utilizing the app. 

For big warehouses, it would be relatively easy to setup the layout and furniture. However, manual item management would become challenging in such cases. On the other hand, I believe this application would truly shine in smaller companies where the movement of goods is not as high, and manual management can be easily handled.

There are some applications that offer asset management capabilities, but they differ from the my system. These management solutions are typically barcode-based and do not include real-time location tracking. The process still relies on manual barcode scanning, making the overall workflow similar. Without barcodes, the system cannot function effectively.
