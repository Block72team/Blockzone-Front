import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.sql.DataSource;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

// Declaring a WebServlet called StarServlet, which maps to url "/api/star"
@WebServlet(name = "PostPreviewServlet", urlPatterns = "/api/post-preview")
public class PostPreviewServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setCharacterEncoding("UTF-8");
		response.setContentType("application/json"); // Response mime type
		response.setHeader("Access-Control-Allow-Origin", "*");

		// Retrieve parameter limit from url request.
		String limit = request.getParameter("limit");
		String page = request.getParameter("page");
		String category = request.getParameter("category");
		String region = request.getParameter("region");
		String author = request.getParameter("author");
		String time = request.getParameter("time");
		String keyword = request.getParameter("keyword");
		String tag = request.getParameter("tag");

		// Output stream to STDOUT
		PrintWriter out = response.getWriter();

		try {
			Context initCtx = new InitialContext();

            Context envCtx = (Context) initCtx.lookup("java:comp/env");
            if (envCtx == null)
				throw new Exception("context is null");

            // Look up our data source
			DataSource dataSource = (DataSource) envCtx.lookup("jdbc/masterdb");
			
			// Get a connection from dataSource
			Connection dbcon = dataSource.getConnection();

			// Construct a query with parameter represented by "?"
			String query = "select p.id, title, author, content, p.update_time, c.id as c_id, c.name as c_name, i.thumb_url, i.url as photo_url ";
				  query += "from posts as p, categories as c, images as i, post_with_tag as pt ";
				  query += "where p.status = 1 and p.image_header_id = i.id and p.category_id = c.id and p.id = pt.post_id ";
				  query += category !=null ? "and c.id = ? " : "";
				  query += region != null ? "and p.region = ? " : "";
				  query += author != null ? "and p.author = ? " : "";
				  query += time != null ? "and p.update_time LIKE ?" : "";
				  query += keyword != null ? "and (p.author LIKE ? OR p.title LIKE ? OR p.content LIKE ? )" : "";
				  query += tag != null ? "and pt.tag_id = ? " : "";
				  query += "group by p.id, title, author, content, p.update_time, c_name, i.thumb_url, photo_url ";
				  query += "order by p.update_time DESC limit ?,?";
			System.out.println(query);
				  
			// Declare our statement
			PreparedStatement statement = dbcon.prepareStatement(query);

			// Set the parameter represented by "?" in the query to the id we get from url,
			// num 1 indicates the first "?" in the query
			int index = 1;
			if(category != null) {
				statement.setInt(index++, Integer.parseInt(category));
			}
			if(region != null) {
				statement.setString(index++, region);
			}
			if(author != null) {
				statement.setString(index++, author);
			}
			if(time != null) {
				statement.setString(index++, time+"%");
			}
			if(keyword != null) {
				statement.setString(index++, "%" + keyword + "%");
				statement.setString(index++, "%" + keyword + "%");
				statement.setString(index++, "%" + keyword + "%");
			}
			if(tag != null) {
				statement.setInt(index++, Integer.parseInt(tag));
			}
			statement.setInt(index++, Integer.parseInt(limit)*Integer.parseInt(page));
			statement.setInt(index, Integer.parseInt(limit));

			// Perform the query
			ResultSet rs = statement.executeQuery();

			JsonArray jsonArray = new JsonArray();

			// Iterate through each row of rs
			while (rs.next()) {
				String r_id = rs.getString("id");
				String r_title = rs.getString("title");
				String r_author = rs.getString("author");
				String r_update_time = rs.getString("update_time");
				String r_content = rs.getString("content");
				String r_c_id = rs.getString("c_id");
				String r_c_name = rs.getString("c_name");
				String r_thumb_url = rs.getString("thumb_url");
				String r_photo_url = rs.getString("photo_url");

				// Create a JsonObject based on the data we retrieve from rs

				JsonObject jsonObject = new JsonObject();
				jsonObject.addProperty("id", r_id);
                jsonObject.addProperty("title", r_title);
                jsonObject.addProperty("content", r_content);
				jsonObject.addProperty("author", r_author);
				jsonObject.addProperty("c_id", r_c_id);
				jsonObject.addProperty("c_name", r_c_name);
				jsonObject.addProperty("thumb_url", r_thumb_url);
				jsonObject.addProperty("update_time", r_update_time);
				jsonObject.addProperty("photo_url", r_photo_url);
				// jsonObject.addProperty("query", query);

				jsonArray.add(jsonObject);
			}
			
            // write JSON string to output
            out.write(jsonArray.toString());
            // set response status to 200 (OK)
            response.setStatus(200);

			rs.close();
			statement.close();
			dbcon.close();
		} catch (Exception e) {
			// write error message JSON object to output
			JsonObject jsonObject = new JsonObject();
			jsonObject.addProperty("errorMessage", e.getMessage());
			out.write(jsonObject.toString());

			// set reponse status to 500 (Internal Server Error)
			response.setStatus(500);
		}
		out.close();

	}

}
