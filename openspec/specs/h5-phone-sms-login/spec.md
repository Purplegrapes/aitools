## ADDED Requirements

### Requirement: H5 Login Page SHALL Support SMS Code Delivery
系统 SHALL 提供 H5 手机号登录页并支持发送短信验证码，且发送行为必须具备基础防重复触发能力。

#### Scenario: User requests SMS code with valid phone number
- **WHEN** 用户输入合法手机号并点击“发送验证码”
- **THEN** 系统 SHALL 调用验证码发送接口
- **AND** 接口成功后 SHALL 启动倒计时并临时禁用重复发送

#### Scenario: User requests SMS code with invalid phone number
- **WHEN** 用户手机号为空或格式不合法
- **THEN** 系统 SHALL 阻止发送请求
- **AND** 页面 SHALL 展示明确的输入校验提示

### Requirement: H5 Login Page SHALL Authenticate With Phone And SMS Code
系统 SHALL 支持用户通过手机号与短信验证码提交登录，并在成功后写入统一登录态。

#### Scenario: Phone login succeeds
- **WHEN** 用户输入合法手机号与正确验证码并提交
- **THEN** 系统 SHALL 调用手机号验证码登录接口
- **AND** 登录成功后 SHALL 写入 token 与登录状态
- **AND** 系统 SHALL 跳转到 referrer 或默认首页

#### Scenario: Phone login fails
- **WHEN** 登录接口返回验证码错误、验证码过期或其他失败
- **THEN** 系统 SHALL 保持在登录页
- **AND** 系统 SHALL 展示可理解的失败提示
- **AND** 系统 SHALL 不写入伪造或空 token 到登录态

### Requirement: H5 Login Flow SHALL Share Auth State Contract With Redirect Login
系统 SHALL 让 H5 手动登录与中转页自动登录复用同一登录态契约，保证后续页面鉴权行为一致。

#### Scenario: User logs in from H5 login page and opens tamp-related page
- **WHEN** 用户在 H5 登录页登录成功后访问需要登录态的页面
- **THEN** 页面 SHALL 识别为已登录状态
- **AND** 不应要求用户再次完成登录

#### Scenario: Token is cleared after logout
- **WHEN** 用户执行退出登录动作
- **THEN** H5 登录路径与中转登录路径共享的 token 状态 SHALL 同步失效
- **AND** 受保护页面 SHALL 重新触发登录流程
