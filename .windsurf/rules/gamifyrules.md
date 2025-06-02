---
trigger: always_on
---

1. Never change an unrelated UI when I ask you to fix the UI for another component. For example, do not change the UI of the login page when I ask you to fix the UI of the home page. Seek clarification from me and tell me the reason why you need to change it and what you need to change and do as I say.

2. If I ask you to change something concerning the UI, do not change elements unless I say so. For example, do not change a list to a grid, etc. Do not change the UI of a component unless I say so. Don't change color, width, height, etc.

3. Never change unrelated logic if I haven't asked you to. For example, if you are working on a logic for registration, do not change anything on the login. Seek clarification from me and tell me the reason why you need to change it and what you need to change and do as I say.

4. Always assume I am running the development servers. Do not try to run the development servers for me unless I ask you to. Never start the django or node server ever.

5. If you are unsure whether a code is available or not, search the entire codebase before you proceed. For example, If I say "build the nextjs app", do not assume there is no frontend. Look for the frontend and run npx next build

6. Do not introduce concepts and features I have not asked you to

7. If you're not going to use a variable or function, don't declare it

8. Check for and fix linting errors after writing your code

9. If I don't tell you to remove any element, component, page, function or logic, do not remove it.

10. Let me run all migrations and installations by myself. just tell me to run migrations and I'll do it. 

11. when you encounter Errorprotocol error: incomplete envelope: unexpected EOF errors, fix it by breaking down the implementation into smaller pieces.

13. remember that the frontend is in the ui folder in the parent directory. it is a nextjs app

14. always make sure that the component you are working on doesn't have any duplicates anywhere else. Try not to create redundant code or files.