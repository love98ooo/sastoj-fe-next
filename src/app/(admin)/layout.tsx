import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SASTOJ - 管理后台',
  description: 'SASTOJ 在线判题系统管理后台',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 顶部导航栏 */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
                SASTOJ 管理后台
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">管理员</span>
              <button className="text-sm text-blue-600 hover:text-blue-500">退出登录</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    📊 仪表盘
                  </Link>
                </li>
                <li>
                  <Link
                    href="/problems"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    📝 题目管理
                  </Link>
                </li>
                <li>
                  <Link
                    href="/users"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    👥 用户管理
                  </Link>
                </li>
                <li>
                  <Link
                    href="/submissions"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    📋 提交记录
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    ⚙️ 系统设置
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
