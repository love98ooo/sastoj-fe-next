'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tokenManager } from '@/lib/auth';
import { API_BASE_URL } from '@/lib/api';

export default function StatusPage() {
  const [status, setStatus] = useState({
    auth: false,
    api: false,
    components: false,
  });

  const [authInfo, setAuthInfo] = useState<any>(null);
  const [apiTest, setApiTest] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = tokenManager.isAuthenticated();
    const user = tokenManager.getUserFromToken();

    setAuthInfo({
      isAuthenticated,
      user,
      token: tokenManager.getToken()?.substring(0, 20) + '...',
    });

    // Test API connectivity
    testApiConnectivity();

    setStatus({
      auth: isAuthenticated,
      api: false, // Will be updated by API test
      components: true, // Assume true if this page loads
    });
  }, []);

  const testApiConnectivity = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/contests`, {
        headers: {
          Token: tokenManager.getToken() || '',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      setApiTest({
        success: response.ok,
        status: response.status,
        data: data,
      });

      setStatus(prev => ({ ...prev, api: response.ok }));
    } catch (error) {
      console.error('API test failed:', error);
      setApiTest({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setStatus(prev => ({ ...prev, api: false }));
    }
  };

  const StatusIndicator = ({ status, label }: { status: boolean; label: string }) => (
    <div className="flex items-center space-x-2">
      <span className={`text-lg ${status ? 'text-green-500' : 'text-red-500'}`}>
        {status ? '✅' : '❌'}
      </span>
      <span className={status ? 'text-green-700' : 'text-red-700'}>{label}</span>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">System Status</h1>
        <p className="text-gray-600">Check the health of SASTOJ application components</p>
      </div>

      {/* Overall Status */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <StatusIndicator status={status.auth} label="Authentication" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <StatusIndicator status={status.api} label="API Connectivity" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <StatusIndicator status={status.components} label="UI Components" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Authentication Details */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={authInfo?.isAuthenticated ? 'default' : 'destructive'}>
                  {authInfo?.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </Badge>
              </div>
              {authInfo?.user && (
                <>
                  <div className="flex justify-between">
                    <span>Username:</span>
                    <span className="font-mono">{authInfo.user.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Role:</span>
                    <span className="font-mono">{authInfo.user.role}</span>
                  </div>
                </>
              )}
              {authInfo?.token && (
                <div className="flex justify-between">
                  <span>Token:</span>
                  <span className="font-mono text-xs">{authInfo.token}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>API Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {apiTest ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={apiTest.success ? 'default' : 'destructive'}>
                    {apiTest.success ? 'Connected' : 'Failed'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>API URL:</span>
                  <span className="font-mono text-xs">{API_BASE_URL}</span>
                </div>
                {apiTest.status && (
                  <div className="flex justify-between">
                    <span>HTTP Status:</span>
                    <span className="font-mono">{apiTest.status}</span>
                  </div>
                )}
                {apiTest.error && (
                  <div className="text-red-600 text-xs mt-2">Error: {apiTest.error}</div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Testing API connectivity...</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Raw Data */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Raw API Response</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
            {JSON.stringify(apiTest?.data || {}, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex space-x-4">
        <Button onClick={() => window.location.reload()}>Refresh Status</Button>
        <Button variant="outline" onClick={() => (window.location.href = '/login')}>
          Go to Login
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = '/problems')}>
          Go to Problems
        </Button>
      </div>
    </div>
  );
}
