import { Env } from '../config/env';
import { AuthContext } from '../middleware/auth';
import { createResponse, createErrorResponse } from '../utils/response';
import { getSupabase } from '../config/supabase';

export async function getRecommendations(request: Request, env: Env, auth: AuthContext): Promise<Response> {
    try {
        const supabase = getSupabase(env, auth.token);

        // Verify user is a student
        const { data: user } = await supabase
            .from('users')
            .select('role')
            .eq('id', auth.user.id)
            .single();

        if (user?.role !== 'student') {
            return createErrorResponse('Unauthorized: Only students can get recommendations', null, 403);
        }

        // Fetch student profile to get their skills/interests to base recommendation on
        const { data: profile, error: profileError } = await supabase
            .from('student_profiles')
            .select('skills, interests, preferred_domain')
            .eq('user_id', auth.user.id)
            .single();

        if (profileError || !profile) {
            return createErrorResponse('Student profile not found, cannot provide recommendations', profileError, 404);
        }

        // Construct a text string representing the student profile
        const profileText = [
            profile.preferred_domain,
            ...((profile.skills as string[]) || []),
            ...((profile.interests as string[]) || [])
        ].filter(Boolean).join(' ');

        if (!profileText) {
            return createResponse([], 'No skills or interests found to base recommendations on', 200);
        }

        // 1. Get embedding for the student profile using Workers AI
        let embedding: number[] = [];
        if (env.AI) {
            const aiResponse = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
                text: profileText
            });
            embedding = aiResponse.data[0];
        } else {
            return createErrorResponse('Workers AI not configured', null, 500);
        }

        // 2. Query Vectorize for matching internships
        let vectorMatches = [];
        if (env.VECTORIZE) {
            const vectorizeResponse = await env.VECTORIZE.query(embedding, {
                topK: 10,
                returnVectors: false
            });
            vectorMatches = vectorizeResponse.matches;
        } else {
            return createErrorResponse('Vectorize not configured', null, 500);
        }

        if (vectorMatches.length === 0) {
            return createResponse([], 'No recommendations found', 200);
        }

        const internshipIds = vectorMatches.map((m: any) => m.id);

        // 3. Fetch matched internship details from Supabase
        const { data: internships, error: internshipsError } = await supabase
            .from('internships')
            .select(`
                *,
                companies (
                    company_name
                )
            `)
            .in('id', internshipIds);

        if (internshipsError) {
            throw internshipsError;
        }

        // Ensure the order matches Vectorize scores
        const orderedInternships = vectorMatches.map((m: any) => {
            const internship = internships?.find((i: any) => i.id === m.id);
            return {
                ...internship,
                score: m.score
            };
        }).filter((i: any) => i.id);

        // 4. Optionally use Workers AI to generate a quick explanation for the top match
        let topMatchExplanation = null;
        if (orderedInternships.length > 0 && env.AI) {
            const topInternship = orderedInternships[0];
            try {
                const explanationPrompt = `Explain in one short sentence why a student with these skills: "${profileText}" is a good match for an internship titled "${topInternship.title}" requiring these skills: "${(topInternship.required_skills || []).join(', ')}".`;
                const explanationResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant that explains why a candidate matches a job.' },
                        { role: 'user', content: explanationPrompt }
                    ]
                });
                topMatchExplanation = explanationResponse.response;
                orderedInternships[0].explanation = topMatchExplanation;
            } catch (aiErr) {
                console.error("Failed to generate explanation:", aiErr);
            }
        }

        return createResponse({
            recommendations: orderedInternships
        });
    } catch (error: any) {
        return createErrorResponse('Failed to fetch recommendations', error.message, 500);
    }
}
