import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const InterviewPage = ({ sessionId, firstQuestion }) => {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* <ChatWindow sessionId={sessionId} firstQuestion={firstQuestion} /> */}
      <Card className="bg-white bg-opacity-10 backdrop-blur-md border-gray-600">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Interview Session</CardTitle>
        </CardHeader>
        <CardContent className="text-white space-y-4">
          <p><span className="font-semibold">Session ID:</span> {sessionId}</p>
          <p><span className="font-semibold">First Question:</span> {firstQuestion}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewPage;
