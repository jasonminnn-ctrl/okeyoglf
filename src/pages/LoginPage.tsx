import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      toast({ title: "로그인 실패", description: result.error, variant: "destructive" });
    } else {
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "비밀번호 오류", description: "비밀번호는 6자 이상이어야 합니다.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await signup(email, password, displayName || undefined);
    setLoading(false);
    if (result.error) {
      toast({ title: "회원가입 실패", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "회원가입 완료", description: "로그인해 주세요." });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ title: "오류", description: "이메일을 입력해 주세요.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "오류", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "이메일 전송 완료", description: "비밀번호 재설정 링크가 이메일로 전송되었습니다." });
      setShowForgotPassword(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
              <span className="text-primary-foreground font-bold text-xl">O</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">비밀번호 재설정</h1>
            <p className="text-muted-foreground text-sm mt-1">가입한 이메일을 입력해 주세요</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">이메일</Label>
                  <Input id="reset-email" type="email" placeholder="email@company.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "전송 중..." : "재설정 링크 보내기"}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setShowForgotPassword(false)}>
                  로그인으로 돌아가기
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">O</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">OkeyGolf AI Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">골프 비즈니스를 위한 AI 운영 매니저</p>
        </div>

        <Card>
          <Tabs defaultValue="login">
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">로그인</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <CardHeader>
                <CardTitle className="text-lg">로그인</CardTitle>
                <CardDescription>계정 정보를 입력하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">이메일</Label>
                    <Input id="login-email" type="email" placeholder="email@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">비밀번호</Label>
                    <Input id="login-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "로그인 중..." : "로그인"}
                  </Button>
                  <Button type="button" variant="link" className="w-full text-sm text-muted-foreground" onClick={() => setShowForgotPassword(true)}>
                    비밀번호를 잊으셨나요?
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader>
                <CardTitle className="text-lg">회원가입</CardTitle>
                <CardDescription>새 계정을 만드세요</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">이름</Label>
                    <Input id="signup-name" type="text" placeholder="홍길동" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">이메일</Label>
                    <Input id="signup-email" type="email" placeholder="email@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">비밀번호</Label>
                    <Input id="signup-password" type="password" placeholder="6자 이상" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "가입 중..." : "회원가입"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 OkeyGolf AI Manager. All rights reserved.
        </p>
      </div>
    </div>
  );
}