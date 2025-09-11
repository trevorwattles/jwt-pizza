**# Learning notes**
**## JWT Pizza code study and debugging**
As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page | `home.tsx` | `_none_` | `_none_` |
| Register new user<br/>(t@jwt.com, pw: test) | `register.tsx` | `[POST] /api/auth` | `INSERT INTO user (name, email, password) VALUES (?, ?, ?)` <br/>`INSERT INTO userRole (userId, role, objectId) VALUES (?, ?, ?)` |
| Login new user<br/>(t@jwt.com, pw: test) | `login.tsx` | `[PUT] /api/auth` | `SELECT * FROM user WHERE email=?` <br/>`SELECT * FROM userRole WHERE userId=?` |
| Order pizza | `menu.tsx` | `[GET] /api/order/menu` <br/>`[POST] /api/order` | `SELECT * FROM menu` <br/>`INSERT INTO dinerOrder (dinerId, franchiseId, storeId, date) VALUES (?, ?, ?, now())` <br/>`INSERT INTO orderItem (orderId, menuId, description, price) VALUES (?, ?, ?, ?)` |
| Verify pizza | `delivery.tsx` | `[POST] https://pizza-factory.cs329.click/api/order/verify` | `_none_` |
| View profile page | `dinerDashboard.tsx` | `[GET] /api/user/me` <br/>`[GET] /api/order` | `SELECT * FROM user WHERE id=?` <br/>`SELECT * FROM userRole WHERE userId=?` <br/>`SELECT id, franchiseId, storeId, date FROM dinerOrder WHERE dinerId=?` <br/>`SELECT id, menuId, description, price FROM orderItem WHERE orderId=?` |
| View franchise<br/>(as diner) | `franchiseDashboard.tsx` | `[GET] /api/franchise/6` | `SELECT objectId FROM userRole WHERE role='franchisee' AND userId=?` |
| Logout | `logout.tsx` | `[DELETE] /api/auth` | `DELETE FROM auth WHERE token=?` |
| View About page | `about.tsx` | `_none_` | `_none_` |
| View History page | `history.tsx` | `_none_` | `_none_` |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) | `login.tsx` | `[PUT] /api/auth` | `SELECT * FROM user WHERE email=?` <br/>`SELECT * FROM userRole WHERE userId=?` |
| View franchise<br/>(as franchisee) | `franchiseDashboard.tsx` | `[GET] /api/franchise/2` | `SELECT objectId FROM userRole WHERE role='franchisee' AND userId=?` <br/>`SELECT id, name FROM franchise WHERE id in (?)` <br/>`SELECT u.id, u.name, u.email FROM userRole AS ur JOIN user AS u ON u.id=ur.userId WHERE ur.objectId=? AND ur.role='franchisee'` <br/>`SELECT s.id, s.name, COALESCE(SUM(oi.price), 0) AS totalRevenue FROM dinerOrder AS do JOIN orderItem AS oi ON do.id=oi.orderId RIGHT JOIN store AS s ON s.id=do.storeId WHERE s.franchiseId=? GROUP BY s.id` |
| Create a store | `createStore.tsx` or franchise dashboard | `[POST] /api/franchise/1/store` | `INSERT INTO store (franchiseId, name) VALUES (?, ?)` |
| Close a store | `closeStore.tsx` or franchise dashboard | `[DELETE] /api/franchise/1/store/3` | `DELETE FROM store WHERE franchiseId=? AND id=?` |
| Login as admin<br/>(a@jwt.com, pw: admin) | `login.tsx` | `[PUT] /api/auth` | `SELECT * FROM user WHERE email=?` <br/>`SELECT * FROM userRole WHERE userId=?` |
| View Admin page | `adminDashboard.tsx` | `[GET] /api/franchise?page=0&limit=3&name=*` | `SELECT id, name FROM franchise WHERE name LIKE ? LIMIT ? OFFSET ?` <br/>`SELECT u.id, u.name, u.email FROM userRole AS ur JOIN user AS u ON u.id=ur.userId WHERE ur.objectId=? AND ur.role='franchisee'` <br/>`SELECT s.id, s.name, COALESCE(SUM(oi.price), 0) AS totalRevenue FROM dinerOrder AS do JOIN orderItem AS oi ON do.id=oi.orderId RIGHT JOIN store AS s ON s.id=do.storeId WHERE s.franchiseId=? GROUP BY s.id` |
| Create a franchise for t@jwt.com | | | |
| Close the franchise for t@jwt.com | | | |
